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
	propsTree = $state([]);

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
		const newPropsTree = [];

		Object.keys(instanceProps).forEach((key) => {
			newProps[key] = this.createProp(instanceProps[key]);

			const { group, folder } = newProps[key];

			if (group && !newPropsGroups.includes(group)) {
				newPropsGroups.push(group);
			}

			if (folder) {
				let names = folder.split('.');

				for (let i = 0; i < names.length; i++) {
					let name = names[i];
					let depth = i;
					let parentName = i > 0 ? names[i - 1] : undefined;
					let parent = parentName
						? newPropsFolders.find(
								(f) =>
									f.displayName === parentName &&
									f.depth === depth - 1,
							)
						: undefined;

					let fieldgroup = newPropsFolders.find(
						(f) =>
							f.displayName === name &&
							f.depth === depth &&
							f.parent === parent,
					);

					if (!fieldgroup) {
						const collapsed = false;
						fieldgroup = {
							type: 'fieldgroup',
							displayName: name,
							collapsed,
							__initialCollapsed: collapsed,
							children: [],
							parent,
							depth,
						};

						if (parent) {
							parent.children.push(fieldgroup);
						}

						newPropsFolders.push(fieldgroup);

						if (depth === 0) {
							newPropsTree.push(fieldgroup);
						}
					}

					if (i === names.length - 1) {
						fieldgroup.children.push({
							type: 'field',
							key,
						});
					}
				}
			} else {
				newPropsTree.push({
					type: 'field',
					key,
				});
			}
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

		const restorePropsFoldersState = (prevFolders) => {
			const restoreFolder = (prevFolder) => {
				const newFolder = newPropsFolders.find((f) => {
					return (
						prevFolder.displayName === f.displayName &&
						prevFolder.depth === f.depth
					);
				});

				if (
					newFolder &&
					newFolder.__initialCollapsed ===
						prevFolder.__initialCollapsed
				) {
					newFolder.collapsed = prevFolder.collapsed;
				}
			};

			if (prevFolders.length > 0) {
				prevFolders.forEach((prevFolder) => {
					restoreFolder(prevFolder);
				});
			}
		};

		if (previous) {
			restoreProps(previous.props);
			restorePropsFoldersState(previous.propsFolders);
		} else {
			const {
				props: savedProps = {},
				propsFolders: savedPropsFolders = [],
			} = hydrate(this.key);
			restoreProps(savedProps);
			restorePropsFoldersState(savedPropsFolders);
		}

		Object.keys(newProps).forEach((key) => {
			const newProp = newProps[key];

			// compute hidden after restoring props values
			newProp.hidden = newProp.__hidden();
		});

		this.props = newProps;
		this.propsGroups = newPropsGroups;
		this.propsFolders = newPropsFolders;
		this.propsTree = newPropsTree;
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
			folder,
			displayName,
		} = instanceProp;

		if (value.isColor) {
			value = { r: value.r, g: value.g, b: value.b };
		} else if (value.isVector2) {
			value = { x: value.x, y: value.y };
		} else if (value.isVector3) {
			value = { x: value.x, y: value.y, z: value.z };
		} else if (value.isVector4) {
			value = { x: value.x, y: value.y, z: value.z, w: value.w };
		} else if (value.isQuaternion) {
			value = { x: value.x, y: value.y, z: value.z, w: value.w };
		}

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
			folder,
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

	updateFolder(folder, collapsed) {
		this.propsFolders.forEach((f, index) => {
			if (f === folder) {
				this.propsFolders[index].collapsed = collapsed;
			}
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
	}

	sync() {
		Object.keys(this.instance.props ?? {}).forEach((key) => {
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

				if (instanceProp.folder !== prop.folder) {
					if (instanceProp.folder) {
						if (prop.folder) {
							// remove it from the current folder it is
							let names = prop.folder.split('.');
							let displayName = names[names.length - 1];
							let depth = names.length - 1;

							console.log({ displayName, depth });

							const currentFolderIndex =
								this.propsFolders.findIndex(
									(f) =>
										f.depth === depth &&
										f.displayName === displayName,
								);
							const currentFolder =
								this.propsFolders[currentFolderIndex];

							if (currentFolder) {
								const childIndex =
									currentFolder.children.findIndex(
										(c) => c.key === key,
									);
								currentFolder.children.splice(childIndex, 1);

								if (currentFolder.children.length === 0) {
									console.log('remove folder');
									this.propsFolders.splice(
										currentFolderIndex,
										1,
									);
								}
							} else {
								console.warn(`cannot retrieve previous folder`);
								console.log(this.propsFolders);
							}
						} else {
							// remove it from tree root
							const index = this.propsTree.findIndex(
								(c) => c.key === key,
							);
							this.propsTree.splice(index, 1);
						}

						let names = instanceProp.folder.split('.');

						for (let i = 0; i < names.length; i++) {
							let name = names[i];
							let depth = i;
							let parentName = i > 0 ? names[i - 1] : undefined;
							let parent = parentName
								? this.propsFolders.find(
										(f) =>
											f.displayName === parentName &&
											f.depth === depth - 1,
									)
								: undefined;

							let fieldgroup = this.propsFolders.find(
								(f) =>
									f.displayName === name &&
									f.depth === depth &&
									f.parent === parent,
							);

							if (!fieldgroup) {
								const collapsed = false;
								fieldgroup = {
									type: 'fieldgroup',
									displayName: name,
									collapsed,
									__initialCollapsed: collapsed,
									children: [],
									parent,
									depth,
								};

								if (parent) {
									parent.children.push(fieldgroup);
								}

								this.propsFolders.push(fieldgroup);

								if (depth === 0) {
									this.propsTree.push(fieldgroup);
								}
							}

							if (i === names.length - 1) {
								fieldgroup.children.push({
									type: 'field',
									key,
								});
							}
						}
					} else {
						// check if folder removed
					}

					console.log('folder structure has changed');
					prop.folder = instanceProp.folder;
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
			propsFolders: this.propsFolders.map(
				({
					displayName,
					depth,
					parent,
					collapsed,
					__initialCollapsed,
				}) => ({
					displayName,
					depth,
					collapsed,
					__initialCollapsed,
					parent: this.propsFolders.findIndex(
						(f) =>
							f.displayName === parent?.displayName &&
							f.depth === parent?.depth,
					),
				}),
			),
		};
	}

	get backgroundColor() {
		return this.instance.backgroundColor;
	}
}

export default Sketch;
