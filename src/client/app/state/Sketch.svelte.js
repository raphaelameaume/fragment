import { exports } from './exports.svelte';
import { rendering } from './rendering.svelte';
import { displayError, errors } from '../state/errors.svelte.js';
import { deepAssign, hydrate, isObject, persist } from './utils.svelte';
import { recordCanvas } from '../utils/canvas.utils.js';

const noop = () => {};

class Sketch {
	props = $state({});
	canvas = $state(null);
	backgroundColor = $state('inherit');
	paused = $state(false);

	constructor({ key, instance, previous }) {
		this.key = key;
		this.instance = instance;
		this.framerate = isFinite(this.instance.fps) ? this.instance.fps : 60;
		this.load = this.instance.load ?? noop;
		this.setup = this.instance.setup ?? this.instance.init ?? noop;
		this.draw = this.instance.draw ?? this.instance.update ?? noop;
		this.resize = this.instance.resize ?? noop;
		this.duration = this.instance.duration;
		this.backgroundColor = this.instance.backgroundColor ?? 'inherit';

		this.recording = null;
		this.params = {};

		this.reconcile(previous);

		$effect.root(() => {
			$effect(() => {
				if (exports.recording && !this.recording) {
					this.record();
				} else if (this.recording && !exports.recording) {
					this.recording.stop();
					this.recording = null;
				}
			});

			$effect(() => {
				const { width, height, pixelRatio } = rendering;

				console.log('resize sketch');
			});
		});
	}

	async init() {
		console.log(`Sketch :: init`);
		// this.renderer = await rendering.findRenderer({
		// 	rendering: this.instance.rendering,
		// 	renderer: this.instance.renderer,
		// });
	}

	render({ time, deltaTime }) {
		const { id, canvas, renderer, framerate, duration } = this;
		const draw = this.instance.draw ?? this.instance.update ?? noop;

		let playhead = NaN;
		let playcount = NaN;
		let frame = NaN;
		let hasDuration = isFinite(duration);

		let frameLength = 1000 / framerate;
		let frameCount = framerate * duration;
		let interval = 1 / frameCount;

		let t = rendering.sync
			? time
			: Math.floor(time / frameLength) * frameLength;

		if (hasDuration && framerate > 0) {
			playhead = t / 1000 / duration;
			playhead %= 1;
			playhead = Math.floor(playhead / interval) * interval;
			playcount = Math.floor(time / 1000 / duration);
			frame = Math.floor(map(playhead, 0, 1, 1, frameCount + 1));
		}

		try {
			renderer?.onBeforeUpdatePreview?.({
				id,
				canvas,
				container: canvas.parentNode,
			});

			draw({
				...renderer,
				...this.params,
				playhead,
				playcount,
				frame,
				time: t,
				deltaTime,
			});

			renderer?.onAfterUpdatePreview?.({ id, canvas, container });
		} catch (error) {
			console.error(error);
			displayError(error, this.key);
		}
	}

	reset() {
		Object.keys(this.props).forEach((key) => {
			this.updateProp(key, this.props[key].__initialValue);
		});

		// this.mount();
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

		this.props = newProps;
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
	}

	save() {
		persist(this.key, this);
	}

	record() {
		function onRecordEnd() {
			this.recording = null;
			this.paused = false;

			// afterRecordCallbacks.forEach((callback) => {
			// 	callback(recordArgs);
			// });

			this.render();
		}

		let recordOptions = {
			params: {
				props: this.props,
			},
			filename: this.key,
			exportDir: this.exportDir,
			pattern: this.filenamePattern,
			onTick: (params) => this.render(params),
			framerate: exports.framerate,
			format: exports.videoFormat,
			imageEncoding: exports.imageEncoding,
			quality: exports.videoQuality,
			onStart: () => {
				// beforeRecordCallbacks.forEach((callback) => {
				// 	callback(recordArgs);
				// });

				elapsedRenderingTime = 0;
				this.paused = true;
			},
			onComplete: () => {
				exports.recording = false;
				onRecordEnd();
			},
		};

		if (exports.useDuration) {
			recordOptions.duration = this.duration * exports.loopCount;
		}

		this.recording = recordCanvas(this.canvas, recordOptions);
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
