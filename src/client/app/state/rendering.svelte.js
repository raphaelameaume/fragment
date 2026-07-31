import { PRESET_ORIENTATIONS, getDimensionsForPreset } from '../lib/presets';
import { map } from '../utils/math.utils.js';
import { clearError, displayError } from './errors.svelte.js';
import { exports } from './exports.svelte.js';
import { layout } from './layout.svelte.js';
import { persist, hydrate } from './utils.svelte';
import presets from '../lib/presets';
import { client } from '../client.js';
import Mouse from '../inputs/Mouse.js';
import Trigger from '../triggers/Trigger.js';
import { Inputs } from '../inputs/index.js';
import {
	defaultFilenamePattern,
	getFilenameParams,
} from '@fragment/utils/canvas.utils.js';
import Sketch from './Sketch.svelte.js';

export const SIZES = {
	FIXED: 'fixed',
	PRESET: 'preset',
	ASPECT_RATIO: 'aspect-ratio',
	WINDOW: 'window',
	SCALE: 'scale',
};

/** @typedef InitParamsRenderer
 * @property {number} width
 * @property {number} height
 * @property {number} pixelRatio
 * @property {HTMLCanvasElement} canvas
 */

/** @typedef {InitParamsRenderer & { id: number, container: HTMLDivElement}} PreviewParamsRenderer
 */

/** @typedef Renderer
 * @property {(params: InitParamsRenderer & any) => void} [init]
 * @property {(params: InitParamsRenderer & any) => void} [resize]
 * @property {(params: PreviewParamsRenderer & any) => any} [onMountPreview]
 * @property {(params: { id: number }) => void} [onBeforeUpdatePreview]
 * @property {(params: { id: number }) => void} [onAfterUpdatePreview]
 * @property {(params: PreviewParamsRenderer & any) => void} [onResizePreview]
 * @property {(params: { id: number }) => void} [onDestroyPreview]
 */

/**
 * @typedef {object} Monitor
 * @property {number} id
 * @property {{ width?: number, height?: number }} dimensions
 */

let MONITOR_ID = 0;

class Rendering {
	width = $state(1024);
	fixedWidth = $state(1024);
	height = $state(1024);
	fixedHeight = $state(1024);
	pixelRatio = $state(1);
	resizing = $state(SIZES.FIXED);
	aspectRatio = $state(1);
	scale = $state(1);
	preset = $state('a4');
	presetOrientation = $state(PRESET_ORIENTATIONS.PORTRAIT);
	refreshRate = $state(0);
	/** @type {Monitor[]} */
	monitors = $state([]);
	/** @type {Render[]} */
	renders = $state([]);

	constructor() {
		this.key = 'rendering';

		/** @type {Record<string, { instance: Renderer, params: Record<any, any>}>} */
		this.renderers = {};
		this.recording = false;
		// sync time between multiple windows
		this.today = new Date();
		this.today.setHours(0);
		this.today.setMinutes(0);
		this.today.setSeconds(0);
		this.today.setMilliseconds(0);
		this.today = this.today.getTime();

		$effect.root(() => {
			$effect(() => {
				if (!layout.previewing && !__BUILD__) {
					persist(this.key, {
						width: this.width,
						height: this.height,
						fixedWidth: this.fixedWidth,
						fixedHeight: this.fixedHeight,
						pixelRatio: this.pixelRatio,
						resizing: this.resizing,
						aspectRatio: this.aspectRatio,
						scale: this.scale,
						preset: this.preset,
						presetOrientation: this.presetOrientation,
					});
				}
			});

			$effect(() => {
				const { width, height, pixelRatio } = this;

				const keys = Object.keys(this.renderers);

				if (keys.length > 0) {
					keys.forEach((key) => {
						const { params, instance } = this.renderers[key];

						instance?.resize?.({
							width,
							height,
							pixelRatio,
							...params,
						});
					});
				}
			});
		});

		hydrate(this.key, this);

		this.estimateRefreshRate();
	}

	/**
	 *
	 * @param {string|undefined} renderingMode
	 * @returns {Promise<Renderer>|undefined}
	 */
	loadRenderer(renderingMode) {
		if (__THREE_RENDERER__ && renderingMode === 'three') {
			return import('../renderers/THREERenderer.js');
		}

		if (__FRAGMENT_RENDERER__ && renderingMode === 'fragment') {
			return import('../renderers/FragmentRenderer.js');
		}

		if (__P5_RENDERER__ && renderingMode === 'p5') {
			return import('../renderers/P5Renderer.js');
		}

		if (__P5_WEBGL_RENDERER__ && renderingMode === 'p5-webgl') {
			return import('../renderers/P5GLRenderer.js');
		}

		if (__2D_RENDERER__ && renderingMode === '2d') {
			return import('../renderers/2DRenderer.js');
		}
	}

	/**
	 *
	 * @param {object} params
	 * @param {string|undefined} params.renderingMode
	 * @param {() => Promise<Renderer>|Renderer} params.customRenderer
	 * @returns {Promise<Renderer | undefined>}
	 */
	async preloadRenderer({ renderingMode, customRenderer }) {
		// load and save
		const instance = customRenderer
			? typeof customRenderer === 'function'
				? await customRenderer()
				: customRenderer
			: await this.loadRenderer(renderingMode);

		if (instance) {
			const params =
				instance.init?.({
					canvas: document.createElement('canvas'),
					width: this.width,
					height: this.height,
					pixelRatio: this.pixelRatio,
				}) ?? {};

			instance.resize?.({
				width: this.width,
				height: this.height,
				pixelRatio: this.pixelRatio,
				...params,
			});

			this.renderers[`${renderingMode}`] = {
				instance,
				params,
			};

			return instance;
		}
	}

	/**
	 * @param {object} params
	 * @param {string} params.renderingMode
	 * @returns {Renderer}
	 */
	findRenderer({ renderingMode }) {
		return this.renderers[renderingMode]?.instance;
	}

	/**
	 *
	 * @param {import('./Sketch.svelte.js').SketchBuildConfig} config
	 */
	override(config) {
		if (!config) return;

		if (config.canvasSize) {
			console.warn(
				`buildConfig.canvasSize has been deprecated. Use buildConfig.resizing instead.`,
			);

			config.resizing = config.canvasSize;
		}

		const {
			width,
			height,
			dimensions = [width, height],
			resizing,
			pixelRatio,
		} = config;

		if (resizing && Object.values(SIZES).includes(resizing)) {
			this.resizing = resizing;

			if (resizing === SIZES.PRESET) {
				if (config.preset && presets.includes(config.preset)) {
					const [width, height] = getDimensionsForPreset(
						config.preset,
						{
							pixelsPerInch: 300,
							orientation: config.presetOrientation,
						},
					);

					this.width = width;
					this.height = height;
				} else {
					this.resizing = SIZES.WINDOW;
					console.warn(
						`Cannot compute dimensions for config.preset: ${config.preset}.`,
					);
				}
			} else if (resizing === SIZES.ASPECT_RATIO) {
				const { aspectRatio } = config;

				if (aspectRatio !== undefined && !isNaN(Number(aspectRatio))) {
					this.aspectRatio = aspectRatio;
				} else {
					this.resizing = SIZES.WINDOW;

					console.warn(
						`Cannot compute canvas size for config.aspectRatio: ${aspectRatio}.`,
					);
				}
			} else if (resizing === SIZES.SCALE) {
				const { scale } = config;

				if (!dimensions) {
					console.warn(
						`Cannot apply resizing:"scale" if no dimensions are specified.`,
					);
					this.resizing = SIZES.WINDOW;
				}

				if (scale !== undefined && !isNaN(Number(scale))) {
					this.scale = scale;
				} else {
					console.warn(
						`Cannot compute canvas size for config.scale: ${scale}`,
					);
					this.resizing = SIZES.WINDOW;
				}
			}
		}

		if (
			dimensions &&
			dimensions.length === 2 &&
			dimensions.every((d) => !isNaN(Number(d)))
		) {
			const [w, h] = /** @type {[number, number]}*/ (dimensions);
			this.width = w;
			this.height = h;
		}

		if (pixelRatio) {
			this.pixelRatio =
				typeof pixelRatio === 'function' ? pixelRatio() : pixelRatio;
		}
	}

	estimateRefreshRate() {
		return new Promise((resolve) => {
			/** @type {number[]} */
			const deltas = [];
			const frameCount = 10;
			let count = 0;
			let lastTime = performance.now();

			const findClosestRefreshRate = /** @param {number} targetRate **/ (
				targetRate,
			) => {
				// List of common refresh rates
				const refreshRates = [60, 75, 120, 144, 165, 240, 360];

				// Initialize the closest rate and the minimum difference
				let closestRate = refreshRates[0];
				let minDifference = Math.abs(targetRate - closestRate);

				// Iterate over the refresh rates to find the closest one
				for (let i = 1; i < refreshRates.length; i++) {
					let currentRate = refreshRates[i];
					let currentDifference = Math.abs(targetRate - currentRate);

					if (currentDifference < minDifference) {
						minDifference = currentDifference;
						closestRate = currentRate;
					}
				}

				return closestRate;
			};

			const computeRefreshRate = /** @param {number} time **/ (time) => {
				const deltaTime = time - lastTime;
				lastTime = time;

				if (count < frameCount) {
					deltas.push(deltaTime);
					requestIdleCallback(() =>
						requestAnimationFrame(computeRefreshRate),
					);
					count++;
				} else {
					const refreshRate = Math.round(
						(60 / (deltas[deltas.length - 1] / 1000)) * (1 / 60),
					);

					this.refreshRate = findClosestRefreshRate(refreshRate);
					resolve(this.refreshRate);
				}
			};

			requestIdleCallback(() =>
				requestAnimationFrame(computeRefreshRate),
			);
		});
	}

	getMonitorID() {
		return MONITOR_ID++;
	}
}

export let rendering = new Rendering();

export class Render {
	loading = $state(false);
	loaded = $state(false);
	errored = $state(false);
	paused = $state(false);
	resized = $state(false);

	/**
	 *
	 * @param {object} params
	 * @param {number} params.id
	 * @param {HTMLElement} params.container
	 * @param {Sketch} params.sketch
	 * @param {Renderer} params.renderer
	 */
	constructor({ id, container, sketch, renderer }) {
		this.id = id;
		this.container = container;
		this.width = undefined;
		this.height = undefined;
		this.pixelRatio = undefined;
		this.sketch = sketch;
		this.renderer = renderer;
		this.time = 0;
		this.recording = false;
		/** @type {number|null} */
		this.raf = null;

		/** @type {NodeJS.Timeout|null} */
		let resizeTimeout = null;

		$effect.pre(() => {
			const { width, height, pixelRatio } = rendering;

			if (this.loaded) {
				if (resizeTimeout) clearTimeout(resizeTimeout);

				resizeTimeout = setTimeout(() => {
					if (resizeTimeout) {
						clearTimeout(resizeTimeout);
					}

					resizeTimeout = null;

					this.resize(width, height, pixelRatio);
				}, 0);
			}
		});

		$effect(() => {
			const { width, height, pixelRatio } = rendering;

			if (!this.loaded && !this.loading) {
				this.width = width;
				this.height = height;
				this.pixelRatio = pixelRatio;

				this.init();
			}
		});

		$effect(() => {
			const { version, fps } = this.sketch;

			if (fps === 0) {
				this.invalidate(version);
			}
		});

		$effect(() => {
			const { props } = this.sketch;

			const triggers = [];

			/**
			 *
			 * @param {object} prop
			 * @returns {Function}
			 */
			const createOnTriggerCallback = (prop, key) => {
				if (typeof prop.value === 'function') {
					return () => {
						prop.value();
						this.sketch.version++;
					};
				} else if (typeof prop.value === 'number') {
					const { params } = prop;

					return (event) => {
						const isValueInRange =
							event.value >= 0 && event.value <= 1;
						if (
							isValueInRange &&
							isFinite(params.min) &&
							isFinite(params.max)
						) {
							let v = map(
								event.value,
								0,
								1,
								params.min,
								params.max,
							);
							let step = params.step ? params.step : 1;
							let value = Math.round(v * (1 / step)) / (1 / step);

							this.sketch.updateProp(key, value);
						}
					};
				}
			};

			Object.keys(props).forEach((key) => {
				const prop = props[key];
				const { triggers: propTriggers } = prop;

				propTriggers.forEach((propTrigger) => {
					const trigger = new Trigger({
						...propTrigger,
						fn: createOnTriggerCallback(prop, key),
					});

					triggers.push(trigger);
				});
			});

			triggers.forEach((trigger) => {
				Inputs.forEach((input) => {
					if (trigger.inputType === input.type) {
						input.add(trigger);
					}
				});
			});

			return () => {
				triggers.forEach((trigger) => {
					Inputs.forEach((input) => {
						if (trigger.inputType === input.type) {
							input.remove(trigger);
						}
					});
				});

				Inputs.forEach((input) => {
					const hotListeners = input.triggers.filter(
						(trigger) => trigger.context === this.sketch.key,
					);

					hotListeners.forEach((trigger) => input.remove(trigger));
				});
			};
		});

		this.observer = new MutationObserver((mutationsList) => {
			/**
			 * @typedef {'width' | 'height'} DimensionKey
			 */

			/** @type {DimensionKey[]} */
			const attributes = ['width', 'height'];

			let attributesMutationsList = mutationsList.filter(
				(mutationRecord) =>
					mutationRecord.attributeName &&
					attributes.includes(
						/** @type {DimensionKey} */ (
							mutationRecord.attributeName
						),
					),
			);

			const { pixelRatio } = rendering;

			attributesMutationsList.forEach((mutationRecord) => {
				const { attributeName } = mutationRecord;

				const target = /** @type {HTMLCanvasElement} */ (
					mutationRecord.target
				);

				if (attributeName) {
					const key = /** @type {DimensionKey} */ (attributeName);
					const dimension = Math.round(
						/** @type {number} */ (target[key]) / pixelRatio,
					);
					const needsUpdate = rendering[key] !== dimension;

					if (needsUpdate) {
						console.warn(
							`Canvas ${attributeName} was changed from sketch from ${rendering[key]}px to ${dimension}px.`,
						);
						rendering[key] = dimension;

						if (rendering.resizing !== SIZES.FIXED) {
							if (!__BUILD__) {
								console.warn(
									'Canvas resizing has been switch to fixed.',
								);
							}
							rendering.resizing = SIZES.FIXED;
						}
					}
				}
			});
		});

		this.canvas = this.createCanvas({ container, context: sketch.key });

		this.then = performance.now();

		this.playhead = 0;
		this.playheadLast = 0;
		this.playcount = 0;
		this.frame = 0;

		const { duration, fps } = sketch;

		const numericFps = Number(fps);
		const numericDuration = Number(duration);

		let frameLength = isFinite(numericFps) ? (1 / numericFps) * 1000 : 0;
		let frameCount = numericFps * numericDuration;
		let interval = 1 / frameCount;

		this.elapsed =
			isFinite(numericFps) && fps !== 0
				? this.time - frameLength * Math.floor(this.time / frameLength)
				: 0;

		this.timeTotal = isFinite(numericDuration)
			? this.time -
				numericDuration *
					1000 *
					Math.floor(this.time / (numericDuration * 1000))
			: 0;

		this.renderSketch = (deltaTime = 0) => {
			try {
				this.renderer?.onBeforeUpdatePreview?.({ id });
				sketch.draw({
					...this.params,
					time: this.time,
					deltaTime,
					playhead: this.playhead,
					playcount: this.playcount,
					frame: this.frame,
				});
				this.renderer?.onAfterUpdatePreview?.({ id });
				sketch.sync();
			} catch (error) {
				console.error(error);
				displayError(error, sketch.key);
				this.errored = true;
			}
		};

		this.loop = /** @param {number} time **/ (time) => {
			if (!this.loaded || !this.resized || this.errored) {
				return;
			}

			let totalPlayhead = time / 1000 / numericDuration;
			let playhead = fps === 0 ? 0 : totalPlayhead % 1;

			if (playhead < this.playheadLast) {
				this.playcount++;
			}
			this.playheadLast = playhead;

			if (isFinite(interval)) {
				// round values for low framerates
				playhead = Math.floor(playhead / interval) * interval;
			}

			const now = performance.now();
			const deltaTime = now - this.thenLoop;

			this.playhead = playhead;
			this.frame = Math.floor(map(playhead, 0, 1, 1, frameCount + 1));
			if (
				this.elapsed === 0 ||
				this.elapsed >= frameLength ||
				this.sketch.needsUpdate()
			) {
				this.elapsed = 0;
				this.renderSketch(deltaTime);
				this.thenLoop = now;
			}

			this.timeTotal += deltaTime;
			this.elapsed += deltaTime;
		};

		this.init = async () => {
			if (this.errored) return;

			this.loading = true;

			clearError(this.sketch.key);

			/** @type {Record<any, any>} */
			this.mountParams = this.renderer?.onMountPreview?.(this.params);

			if (this.mountParams && this.mountParams.canvas !== this.canvas) {
				this.destroyCanvas(this.canvas);
				this.canvas = this.createCanvas({
					container: this.container,
					canvas: this.mountParams.canvas,
					context: this.sketch.key,
				});
			}
			const { params } = this;

			try {
				await sketch.load(params);
				await sketch.setup(params);

				this.raf = requestAnimationFrame(() => {
					this.time = new Date().getTime() - rendering.today;
					this.initialTime = this.time;
					this.playheadLast = 0;
					this.playcount = 0;
					this.then = this.time;
					this.thenLoop = performance.now();
					this.update(this.time);
				});

				this.loading = false;
				this.loaded = true;
			} catch (error) {
				console.error(error);
				displayError(error, sketch.key);
				this.errored = true;
			}
		};

		this.removeShaderUpdateListener = client.on('shader-update', () => {
			const { sketch } = this;

			if (sketch.fps === 0) {
				this.renderSketch();
			}
		});
	}

	/**
	 *
	 * @param {Object} params
	 * @param {HTMLElement} params.container
	 * @param {HTMLCanvasElement} [params.canvas]
	 * @param {string} params.context
	 * @returns
	 */
	createCanvas({
		container,
		canvas = document.createElement('canvas'),
		context,
	}) {
		canvas.onmousedown = (event) => Mouse.onMouseDown(event, context);
		canvas.onmousemove = (event) => Mouse.onMouseMove(event, context);
		canvas.onmouseup = (event) => Mouse.onMouseUp(event, context);
		canvas.onclick = (event) => Mouse.onClick(event, context);

		this.observer.observe(canvas, {
			attributes: true,
		});

		if (container) {
			container.appendChild(canvas);
		}

		return canvas;
	}

	/**
	 *
	 * @param {HTMLCanvasElement} canvas
	 */
	destroyCanvas(canvas) {
		if (canvas) {
			this.observer.disconnect();
			canvas.parentNode?.removeChild(canvas);
			canvas.onmousedown = null;
			canvas.onmousemove = null;
			canvas.onmouseup = null;
			canvas.onclick = null;
		}
	}

	/**
	 *
	 * @param {object} [options]
	 * @param {string} [options.filename]
	 * @param {import('../utils/canvas.utils.js').FilenamePattern} [options.pattern]
	 * @param {string} [options.exportDir]
	 * @param {File[]} [options.files]
	 * @param {boolean} [options.commit]
	 * @param {import('./exports.svelte.js').ImageEncoding} [options.encoding]
	 * @param {number} [options.quality]
	 * @param {number} [options.pixelsPerInch]
	 */
	async screenshot({
		filename = this.sketch.key,
		pattern = this.sketch.filenamePattern,
		exportDir = this.sketch.exportDir,
		files = [],
		commit = false,
		encoding,
		quality,
		pixelsPerInch,
	} = {}) {
		const { sketch } = this;

		await exports.screenshot(this.canvas, {
			encoding,
			quality,
			pixelsPerInch,
			filename,
			pattern,
			exportDir,
			params: {
				props: sketch.props,
			},
			files,
			commit,
			onBeforeCapture: (params) => {
				sketch.beforeCapture.forEach((fn) => fn(params));
				this.renderSketch();
			},
			onAfterCapture: (params) => {
				sketch.afterCapture.forEach((fn) => fn(params));
				this.renderSketch();
			},
		});
	}

	async commit({
		filename = this.sketch.key,
		pattern = this.sketch.filenamePattern ?? defaultFilenamePattern,
		exportDir = this.sketch.exportDir,
	} = {}) {
		const { sketch } = this;
		const { props } = sketch;

		/** @type {Record<string, { value: any }>} */
		const data = {};

		for (const key in props) {
			data[key] = { value: props[key].value };
		}

		let patternParams = getFilenameParams();
		let name = pattern({
			filename,
			params: { props },
			...patternParams,
		});

		let files = [
			{
				filename: `${name}.props.json`,
				exportDir,
				data: JSON.stringify(data),
			},
		];

		await this.screenshot({
			filename,
			pattern,
			exportDir,
			files,
			commit: true,
		});
	}

	/** @type {import('./Sketch.svelte.js').InitParamsSketch} */
	get params() {
		return {
			...this.mountParams,
			id: this.id,
			canvas: this.canvas,
			container: this.container,
			width: this.width,
			height: this.height,
			pixelRatio: this.pixelRatio,
			publicPath: `@fs${__CWD__}`,
			props: this.sketch?.instance.props ?? {},
		};
	}

	async startRecording() {
		this.paused = true;
		this.recording = true;

		const { sketch } = this;

		if (this.record) {
			console.warn(`Render :: already recording`);
			return;
		}

		this.record = exports.record(this.canvas, {
			filename: sketch.key,
			pattern: sketch.filenamePattern,
			exportDir: sketch.exportDir,
			duration: exports.useDuration ? sketch.duration : undefined,
			params: {
				props: sketch.props,
			},
			onStart: (params) => {
				this.time = 0;
				this.elapsed = 0;
				this.playcount = 0;
				this.playheadLast = 0;
				this.thenLoop = performance.now();

				sketch.beforeRecord.forEach((fn) => fn(params));
			},
			onTick: /** @param {{time: number, deltaTime: number}} **/ ({
				deltaTime,
			}) => {
				this.time += deltaTime;
				this.loop(this.time);
			},
			onComplete: (params) => {
				sketch.afterRecord.forEach((fn) => fn(params));
				this.record = null;
				this.paused = false;
				this.recording = false;
			},
		});
	}

	stopRecording() {
		if (this.record) {
			this.record.stop();
		}

		this.paused = false;
		this.recording = false;
	}

	reset() {
		this.renderer?.onDestroyPreview?.({ id: this.id });

		try {
			this.sketch.instance?.dispose?.();
			this.sketch.reset();

			this.loading = false;
			this.loaded = false;
		} catch (error) {
			console.error(error);
			displayError(error, this.sketch.key);
			this.errored = true;
		}
	}

	/**
	 *
	 * @param {number} width
	 * @param {number} height
	 * @param {number} pixelRatio
	 */
	resize(width, height, pixelRatio) {
		this.width = width;
		this.height = height;
		this.pixelRatio = pixelRatio;
		const { params } = this;
		this.renderer?.onResizePreview?.(params);

		try {
			this.sketch.resize?.(params);
			this.resized = true;
			// trigger re-render
			if (this.sketch.fps === 0) {
				this.invalidate();
			}
			this.observer.takeRecords();
		} catch (error) {
			console.error(error);
			displayError(error, this.sketch.key);
			this.errored = true;
		}
	}

	/**
	 *
	 * @param {number} time
	 */
	update(time) {
		if (!this.paused) {
			const deltaTime = time - this.then;

			this.time += deltaTime;
			this.then = this.time;
			this.loop(this.time);
		}

		this.raf = requestAnimationFrame(() => {
			const t = new Date().getTime() - rendering.today;

			this.update(t);
		});
	}

	/**
	 *
	 * @param {number} [version]
	 */
	invalidate(version) {
		this.time = 0;
		this.elapsed = 0;
		this.playcount = 0;
		this.playheadLast = 0;
	}

	dispose() {
		this.removeShaderUpdateListener();

		const { id, sketch } = this;

		this.renderer?.onDestroyPreview?.({ id });
		this.destroyCanvas(this.canvas);

		try {
			sketch?.instance?.dispose?.();
		} catch (error) {
			console.error(error);
			displayError(error, sketch.key);
			this.errored = true;
		}

		if (this.raf) {
			cancelAnimationFrame(this.raf);
			this.raf = null;
		}
	}
}
