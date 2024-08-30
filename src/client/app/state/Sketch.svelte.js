import { exports } from './exports.svelte';
import { rendering } from './rendering.svelte';
import { deepAssign, hydrate, isObject, persist } from './utils.svelte';
import { recordCanvas } from '../utils/canvas.utils.js';

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

		const duplicateInitialValue = (value) => {
			if (Array.isArray(value)) {
				return [...value];
			} else if (typeof value === 'object') {
				return structuredClone(value);
			}

			return value;
		};

		const newProps = {};
		const newPropsGroups = [];
		const newPropsFolders = [];

		Object.keys(instanceProps).forEach((key) => {
			let {
				value,
				params = {},
				hidden,
				triggers = [],
				group,
				folder,
				displayName,
			} = instanceProps[key];

			if (value.isColor) {
				value = { r: value.r, g: value.g, b: value.b };
			}

			if (group && !newPropsGroups.includes(group)) {
				newPropsGroups.push(group);
			}

			if (folder) {
				const folders = folder.split('.');

				for (let i = 0; i < folders.length; i++) {
					const folderName = folders[i];

					if (
						newPropsFolders.findIndex(
							(f) => f.name === folderName,
						) < 0
					) {
						let parent;
						if (i > 0) {
							parent = folders[i - 1];
						}

						folder = {
							parent,
							name: folderName,
							collapsed: false,
						};

						newPropsFolders.push(folder);
					}
				}
			}

			let __hidden = typeof hidden === 'function' ? hidden : () => hidden;

			newProps[key] = {
				value,
				__initialValue: duplicateInitialValue(value),
				__hidden,
				params,
				triggers,
				group,
				// folder,
				displayName,
			};
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
							newProp.__initialValue === prevProp.__initialValue
						) {
							newProp.value = prevProp.value;
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

	updateProp(key, newValue) {
		const prop = this.props[key];
		const instanceProp = this.instance.props[key];

		if (prop) {
			prop.value = newValue;
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
