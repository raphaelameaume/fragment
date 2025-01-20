import { PRESET_ORIENTATIONS, getDimensionsForPreset } from '../lib/presets';
import {
	checkForTriggersClick,
	checkForTriggersDown,
	checkForTriggersMove,
	checkForTriggersUp,
} from '../triggers/Mouse.js';
import { map } from '../utils/math.utils.js';
import { clearError, displayError } from './errors.svelte.js';
import { exports } from './exports.svelte.js';
import { layout } from './layout.svelte.js';
import { persist, hydrate } from './utils.svelte';
import presets from '../lib/presets';
import { client } from '../client.js';

export const SIZES = {
	FIXED: 'fixed',
	PRESET: 'preset',
	ASPECT_RATIO: 'aspect-ratio',
	WINDOW: 'window',
	SCALE: 'scale',
};

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
	monitors = $state([]);
	renders = $state([]);

	constructor() {
		this.key = 'rendering';

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
					pixelRatio: this.pixelRatio,
					width: this.width,
					height: this.height,
				}) ?? {};

			instance.resize?.({
				pixelRatio: this.pixelRatio,
				width: this.width,
				height: this.height,
				...params,
			});

			this.renderers[`${renderingMode}`] = {
				instance,
				params,
			};

			return instance;
		}
	}

	findRenderer({ renderingMode }) {
		return this.renderers[renderingMode].instance;
	}

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

				if (!isNaN(aspectRatio)) {
					this.aspectRatio = config.aspectRatio;
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

				if (isNaN(scale)) {
					console.warn(
						`Cannot compute canvas size for config.scale: ${scale}`,
					);
					this.resizing = SIZES.WINDOW;
				} else {
					this.scale = scale;
				}
			}
		}

		if (
			dimensions &&
			dimensions.length === 2 &&
			dimensions.every((d) => !isNaN(Number(d)))
		) {
			this.width = dimensions[0];
			this.height = dimensions[1];
		}

		if (pixelRatio) {
			this.pixelRatio =
				typeof pixelRatio === 'function' ? pixelRatio() : pixelRatio;
		}
	}

	estimateRefreshRate() {
		return new Promise((resolve) => {
			const deltas = [];
			const frameCount = 10;
			let count = 0;
			let lastTime = performance.now();

			const findClosestRefreshRate = (targetRate) => {
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

			const computeRefreshRate = (time) => {
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
	loaded = $state(false);
	errored = $state(false);
	paused = $state(false);
	resized = $state(false);

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

		$effect(() => {
			const { width, height, pixelRatio } = rendering;

			if (this.loaded) {
				this.resize(width, height, pixelRatio);
			} else {
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

		this.observer = new MutationObserver((mutationsList) => {
			const attributes = ['width', 'height'];

			let attributesMutationsList = mutationsList.filter(
				(mutationRecord) =>
					attributes.includes(mutationRecord.attributeName),
			);

			const { pixelRatio } = rendering;

			attributesMutationsList.forEach((mutationRecord) => {
				const { target, attributeName } = mutationRecord;

				const dimension = Math.round(
					target[attributeName] / pixelRatio,
				);
				const needsUpdate = rendering[attributeName] !== dimension;

				if (needsUpdate) {
					console.warn(
						`Canvas ${attributeName} was changed from sketch to ${dimension}px to previous  ${rendering[attributeName]}`,
					);
					rendering[attributeName] = dimension;

					if (rendering.resizing !== SIZES.FIXED) {
						if (!__BUILD__) {
							console.warn(
								'Canvas resizing has been switch to fixed.',
							);
						}
						rendering.resizing = SIZES.FIXED;
					}
				}
			});
		});

		this.canvas = this.createCanvas({ container, context: sketch.key });

		this.then = performance.now();

		this.playhead = 0;
		this.playcount = 0;
		this.frame = 0;

		const { duration, fps } = sketch;

		let frameLength = isFinite(fps) ? (1 / fps) * 1000 : 0;
		let frameCount = fps * duration;
		let interval = 1 / frameCount;

		this.elapsed =
			isFinite(fps) && fps !== 0
				? this.time - frameLength * Math.floor(this.time / frameLength)
				: 0;

		this.timeTotal = isFinite(duration)
			? this.time -
				duration * 1000 * Math.floor(this.time / (duration * 1000))
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

		this.loop = (time) => {
			if (!this.loaded || !this.resized || this.errored) {
				return;
			}

			let playhead = time / 1000 / duration;
			playhead %= 1;
			let playcount = 0;
			if (isFinite(interval)) {
				// round values for low framerates
				playhead = Math.floor(playhead / interval) * interval;
			}
			if (isFinite(duration)) {
				playcount = Math.floor(this.timeTotal / 1000 / duration);
			}
			if (fps === 0) {
				playhead = 0;
			}
			const now = performance.now();
			const deltaTime = now - this.thenLoop;

			this.playhead = playhead;
			this.playcount = playcount;
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
			clearError(this.sketch.key);
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
					this.then = this.time;
					this.thenLoop = performance.now();
					this.update(this.time);
				});

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

	createCanvas({
		container,
		canvas = document.createElement('canvas'),
		context,
	}) {
		canvas.onmousedown = (event) => checkForTriggersDown(event, context);
		canvas.onmousemove = (event) => checkForTriggersMove(event, context);
		canvas.onmouseup = (event) => checkForTriggersUp(event, context);
		canvas.onclick = (event) => checkForTriggersClick(event, context);

		this.observer.observe(canvas, {
			attributes: true,
		});

		if (container) {
			container.appendChild(canvas);
		}

		return canvas;
	}

	destroyCanvas(canvas) {
		if (canvas) {
			this.observer.disconnect();
			canvas.parentNode?.removeChild(canvas);
			canvas.onmousedown = null;
			canvas.onmousemove = null;
			canvas.onmouseup = null;
			canvas.onclick = null;
			canvas = null;
		}
	}

	async screenshot({
		filename = this.sketch.name ?? this.sketch.key,
		pattern = this.sketch.filenamePattern,
		exportDir = this.sketch.exportDir,
	} = {}) {
		const { sketch } = this;

		await exports.screenshot(this.canvas, {
			filename,
			pattern,
			exportDir,
			params: {
				props: sketch.props,
			},
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

		this.record = await exports.record(this.canvas, {
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
				this.thenLoop = performance.now();

				sketch.beforeRecord.forEach((fn) => fn(params));
			},
			onTick: ({ time, deltaTime }) => {
				this.loop(time);
			},
			onComplete: (params) => {
				sketch.afterRecord.forEach((fn) => fn(params));
				this.record = null;
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

			this.init();
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

	invalidate() {
		this.time = 0;
		this.elapsed = 0;
	}

	dispose() {
		this.removeShaderUpdateListener();

		const { id, sketch } = this;
		clearError(sketch.key);

		this.renderer?.onDestroyPreview?.({ id });
		this.destroyCanvas(this.canvas);
		sketch?.instance?.dispose?.();

		cancelAnimationFrame(this.raf);
		this.raf = null;
	}
}
