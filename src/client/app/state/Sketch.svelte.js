const noop = () => {};

export default class Sketch {
	props = $state({});
	canvas = $state(null);
	fps = $state(60);
	duration = $state(undefined);
	reload = $state(0);

	constructor({ key, instance, previous }) {
		this.key = key;

		this.instance = instance;
		this.fps = isFinite(this.instance.fps) ? this.instance.fps : 60;
		this.duration = this.instance.duration;
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
				return structuredClone(newProp.value);
			}

			return value;
		};

		const newProps = {};

		Object.keys(instanceProps).forEach((key) => {
			const { value, params = {} } = instanceProps[key];

			newProps[key] = {
				value,
				__initialValue: duplicateInitialValue(value),
				params,
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
			instanceProp.value = newValue;
			instanceProp.onChange?.(instanceProp, params);
		}
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
