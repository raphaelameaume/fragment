import { rendering } from './rendering.svelte';
import {
	deepAssign,
	deepEqual,
	hydrate,
	isObject,
	persist,
} from './utils.svelte';

const noop = () => {};

class Sketch {
	props = $state({});
	canvas = $state(null);
	backgroundColor = $state('inherit');
	paused = $state(false);
	propsGroups = $state([]);
	propsFolders = $state([]);

	constructor({ key, instance, previous }) {
		this.key = key;
		this.instance = instance;
		this.fps = this.instance.fps;
		this.load = this.instance.load ?? noop;
		this.setup = this.instance.setup ?? this.instance.init ?? noop;
		this.draw = this.instance.draw ?? this.instance.update ?? noop;
		this.needsUpdate = this.instance.needsUpdate ?? noop;
		this.resize = this.instance.resize ?? noop;
		this.duration = this.instance.duration;
		this.exportDir = this.instance.exportDir;
		this.filenamePattern = this.instance.filenamePattern;
		this.backgroundColor = this.instance.backgroundColor ?? 'inherit';
		this.buildConfig = this.instance.buildConfig ?? {};

		this.recording = null;
		this.params = {};
		this.beforeCapture = [];
		this.beforeRecord = [];
		this.afterCapture = [];
		this.afterRecord = [];

		this.reconcile(previous);
	}

	reset() {
		Object.keys(this.props).forEach((key) => {
			this.updateProp(key, this.props[key].__initialValue);
		});
	}

	reconcile(previous) {
		const instanceProps = this.instance.props ?? {};
		const newProps = {};
		const newPropsGroups = [];
		const newPropsFolders = [];

		Object.keys(instanceProps).forEach((key) => {
			newProps[key] = this.createProp(instanceProps[key]);
		});

		const restoreProps = (prevProps) => {
			const prevPropKeys = Object.keys(prevProps);

			if (prevPropKeys.length > 0) {
				prevPropKeys.forEach((propKey) => {
					let prevProp = prevProps[propKey];
					let newProp = newProps[propKey];
					let instanceProp = instanceProps[propKey];

					if (newProp) {
						if (
							isObject(newProp.__initialValue) &&
							deepEqual(
								newProp.__initialValue,
								prevProp.__initialValue,
							)
						) {
							deepAssign(newProp.value, prevProp.value);
							deepAssign(instanceProp.value, prevProp.value);
							newProp.__currentValue = newProp.value;
						} else if (
							newProp.__initialValue === prevProp.__initialValue
						) {
							newProp.value = prevProp.value;
							newProp.__currentValue = newProp.value;
							instanceProp.value = prevProp.value;
						}

						newProp.triggers = prevProp.triggers;

						if (prevProp.params) {
							// reconcile locked VectorInput from UI
							if (prevProp.params.locked !== undefined) {
								newProp.params.locked = prevProp.params.locked;
							}
						}
					}
				});
			}
		};

		if (previous) {
			restoreProps(previous.props);
		} else {
			const { props: savedProps = {} } = hydrate(this.key);
			restoreProps(savedProps);
		}

		Object.keys(newProps).forEach((key) => {
			newProps[key].hidden = newProps[key].__hidden();
		});

		this.props = newProps;
		this.propsGroups = newPropsGroups;
		this.propsFolders = newPropsFolders;
	}

	createProp(instanceProp) {
		const duplicateInitialValue = (value) => {
			if (typeof value === 'function') {
				return value;
			}

			if (isObject(value)) {
				return structuredClone(value);
			}

			return value;
		};

		let {
			value,
			params = {},
			triggers = [],
			group,
			displayName,
		} = instanceProp;

		if (value.isColor) {
			value = { r: value.r, g: value.g, b: value.b };
		}

		// if (group && !newPropsGroups.includes(group)) {
		// 	newPropsGroups.push(group);
		// }

		// if (folder) {
		// 	const folders = folder.split('.');

		// 	for (let i = 0; i < folders.length; i++) {
		// 		const folderName = folders[i];

		// 		if (
		// 			newPropsFolders.findIndex(
		// 				(f) => f.name === folderName,
		// 			) < 0
		// 		) {
		// 			let parent;
		// 			if (i > 0) {
		// 				parent = folders[i - 1];
		// 			}

		// 			folder = {
		// 				parent,
		// 				name: folderName,
		// 				collapsed: false,
		// 			};

		// 			newPropsFolders.push(folder);
		// 		}
		// 	}
		// }

		let __hidden =
			typeof instanceProp.hidden === 'function'
				? instanceProp.hidden
				: () => instanceProp.hidden;

		let initialValue = duplicateInitialValue(value);

		return {
			value,
			__initialValue: initialValue,
			__currentValue: value,
			__hidden,
			params: structuredClone(params),
			triggers,
			group,
			// folder,
			displayName,
		};
	}

	updateProp(key, newValue) {
		const prop = this.props[key];
		const instanceProp = this.instance.props[key];

		if (prop) {
			prop.value = newValue;
			prop.__currentValue = newValue;
		}

		if (instanceProp) {
			if (isObject(instanceProp.value)) {
				deepAssign(instanceProp.value, newValue);
			} else {
				instanceProp.value = newValue;
			}

			instanceProp.onChange?.(instanceProp, {
				width: rendering.width,
				height: rendering.height,
				pixelRatio: rendering.pixelRatio,
				canvas: this.canvas,
			});
		}

		Object.keys(this.props).forEach((key) => {
			this.props[key].hidden = this.props[key].__hidden();
		});
	}

	save() {
		persist(this.key, this);
	}

	dispose() {
		// if (this.renderer && typeof renderer.onDestroyPreview === 'function') {
		// 	this.renderer.onDestroyPreview({
		// 		id: this.mountID,
		// 		container,
		// 		canvas,
		// 	});
		// }

		this.destroyCanvas();
	}

	sync() {
		Object.keys(this.instance.props).forEach((key) => {
			const instanceProp = this.instance.props[key];
			const prop = this.props[key];

			if (!prop) {
				this.props[key] = this.createProp(instanceProp);
			} else {
				// sync value
				if (!deepEqual(instanceProp.value, prop.__currentValue)) {
					prop.value = structuredClone(instanceProp.value);
					prop.__currentValue = prop.value;
				}

				// sync displayName
				if (instanceProp.displayName !== prop.displayName) {
					prop.displayName = instanceProp.displayName;
				}

				// sync hidden
				prop.hidden = prop.__hidden();

				// sync params
				if (instanceProp.params) {
					for (const paramKey in instanceProp.params) {
						const instanceParam = instanceProp.params[paramKey];
						const param = prop.params[paramKey];
						let needsUpdate = false;

						if (isObject(instanceParam)) {
							Object.keys(instanceParam).forEach((key) => {
								if (isObject(instanceParam[key])) {
									Object.keys(instanceParam[key]).forEach(
										(k) => {
											if (
												instanceParam[key][k] !==
												param[key][k]
											) {
												needsUpdate = true;
											}
										},
									);
								} else if (instanceParam[key] !== param[key]) {
									needsUpdate = true;
								}
							});
						} else if (instanceParam !== param) {
							needsUpdate = true;
						}

						if (needsUpdate) {
							if (needsUpdate) {
								prop.params[paramKey] =
									structuredClone(instanceParam);
							}
						}
					}
				}

				Object.keys(prop.params).forEach((paramKey) => {
					if (!(paramKey in (instanceProp.params ?? {}))) {
						delete prop.params[paramKey];
					}
				});
			}
		});

		Object.keys(this.props).forEach((key) => {
			if (!(key in (this.instance.props ?? {}))) {
				delete this.props[key];
			}
		});
	}

	onBeforeCapture(fn) {
		this.beforeCapture.push(fn);
	}

	onBeforeRecord(fn) {
		this.beforeRecord.push(fn);
	}

	onAfterCapture(fn) {
		this.afterCapture.push(fn);
	}

	onAfterRecord(fn) {
		this.afterRecord.push(fn);
	}

	toJSON() {
		return {
			props: this.props,
		};
	}

	get backgroundColor() {
		return this.instance.backgroundColor;
	}
}

export default Sketch;
