import { deepAssign, hydrate, isObject, persist } from './utils.svelte';

const noop = () => {};

class Sketch {
	props = $state({});
	canvas = $state(null);
	fps = $state(60);
	duration = $state(undefined);
	reload = $state(0);
	backgroundColor = $state('inherit');

	constructor({ key, instance, previous }) {
		this.key = key;

		this.instance = instance;
		this.fps = isFinite(this.instance.fps) ? this.instance.fps : 60;
		this.duration = this.instance.duration;
		this.backgroundColor = this.instance.backgroundColor ?? 'inherit';
		this.reconcile(previous);
	}

	createCanvas(canvas = document.createElement('canvas')) {
		// 	canvas.onmousedown = (event) => checkForTriggersDown(event, key);
		// 	canvas.onmousemove = (event) => checkForTriggersMove(event, key);
		// 	canvas.onmouseup = (event) => checkForTriggersUp(event, key);
		// 	canvas.onclick = (event) => checkForTriggersClick(event, key);
		this.canvas = canvas;

		return this.canvas;
	}

	destroyCanvas() {}

	reset(params) {
		Object.keys(this.props).forEach((key) => {
			this.updateProp(key, this.props[key].__initialValue, params);
		});

		this.reload += 1;
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

		Object.keys(instanceProps).forEach((key) => {
			let { value, params = {}, triggers = [] } = instanceProps[key];

			if (value.isColor) {
				value = { r: value.r, g: value.g, b: value.b };
			}

			newProps[key] = {
				value,
				__initialValue: duplicateInitialValue(value),
				params,
				triggers,
			};
		});

		if (previous) {
			const prevProps = previous.props;
			const prevPropKeys = Object.keys(prevProps);

			if (prevPropKeys.length > 0) {
				prevPropKeys.forEach((propKey) => {
					let prevProp = prevProps[propKey];
					let newProp = newProps[propKey];

					if (newProp) {
						if (
							newProp.__initialValue === prevProp.__initialValue
						) {
							newProp.value = prevProp.value;
						}

						if (prevProp.params) {
							// reconcile locked VectorInput from UI
							if (prevProp.params.locked !== undefined) {
								newProp.params.locked = prevProp.params.locked;
							}
						}
					}
				});
			}
		} else {
			const { props: savedProps = {} } = hydrate(this.key);
			const savedPropsKeys = Object.keys(savedProps);

			if (savedPropsKeys.length > 0) {
				savedPropsKeys.forEach((propKey) => {
					let savedProp = savedProps[propKey];
					let newProp = newProps[propKey];
					let instanceProp = instanceProps[propKey];

					if (newProp) {
						if (
							newProp.__initialValue === savedProp.__initialValue
						) {
							newProp.value = savedProp.value;
							instanceProp.value = savedProp.value;
						}

						// restore triggers
						newProp.triggers = savedProp.triggers;

						if (savedProp.params) {
							// reconcile locked VectorInput from UI
							if (savedProp.params.locked !== undefined) {
								newProp.params.locked = savedProp.params.locked;
							}
						}
					}
				});
			}
		}

		this.props = newProps;
	}

	updateProp(key, newValue, params) {
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

			instanceProp.onChange?.(instanceProp, params);
		}
	}

	save() {
		persist(this.key, this);
	}

	toJSON() {
		return {
			props: this.props,
		};
	}

	get init() {
		return this.instance.setup ?? this.instance.init ?? noop;
	}

	get draw() {
		return this.instance.draw ?? this.instance.update ?? noop;
	}

	get resize() {
		return this.instance.resize ?? noop;
	}

	get rendering() {
		return this.instance.rendering;
	}

	get backgroundColor() {
		return this.instance.backgroundColor;
	}
}

export default Sketch;
