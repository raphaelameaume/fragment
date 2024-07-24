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

class Render {
	constructor({ id, container, params, canvas, sketch, renderer }) {
		this.id = id;
		this.container = container;
		this.params = params;
		this.canvas = canvas;
		this.sketch = sketch;
		this.renderer = renderer;

		this.time = 0;
		this.elapsed = 0;
		this.lastTime = 0;
		this.playhead = 0;
		this.playcount = 0;
		this.frame = 0;

		const { duration, framerate } = sketch;

		let frameLength = (1 / framerate) * 1000;
		let frameCount = framerate * duration;
		let interval = 1 / frameCount;

		this.renderSketch = (deltaTime = 0) => {
			try {
				renderer?.onBeforeUpdatePreview?.({ id });

				sketch.draw({
					...params,
					time: this.time,
					deltaTime,
					playhead: this.playhead,
					playcount: this.playcount,
					frame: this.frame,
				});

				renderer?.onAfterUpdatePreview?.({ id });
			} catch (error) {
				displayError(error, sketch.key);
			}
		};

		this.loop = ({ deltaTime = 0 } = {}) => {
			let { elapsed, time } = this;

			let playhead = time / 1000 / duration;
			playhead %= 1;
			playhead = Math.floor(playhead / interval) * interval;

			this.playhead = playhead;
			this.playcount = Math.floor(time / 1000 / duration);
			this.frame = Math.floor(map(playhead, 0, 1, 1, frameCount + 1));

			if (this.elapsed === 0 || this.elapsed >= frameLength) {
				this.elapsed = 0;
				this.renderSketch(deltaTime);
			}

			this.time += deltaTime;
			this.elapsed += deltaTime;
		};
	}
}

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
	paused = $state(false);
	/** @type {Render[]} */
	renders = $state([]);

	constructor() {
		this.key = 'rendering';
		this.time = performance.now();
		this.then = this.time;
		this.elapsed = 0;
		this.renderers = {};
		this.recording = false;

		$effect.root(() => {
			$effect(() => {
				if (!layout.previewing) {
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
				const { width, height, pixelRatio } = rendering;

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

			$effect(() => {
				const { width, height, pixelRatio } = rendering;

				if (this.renders.length > 0) {
					this.renders.forEach((render) => {
						const { sketch, renderer, params } = render;

						params.width = width;
						params.height = height;
						params.pixelRatio = pixelRatio;

						renderer?.onResizePreview?.(params);

						sketch.resize?.(params);
					});
				}
			});

			$effect(() => {
				if (exports.recording && !this.recording) {
					this.startRecording();
				} else if (this.recording && !exports.recording) {
					this.stopRecording();
				}
			});
		});

		hydrate(this.key, this);

		this.raf = requestAnimationFrame((t) => {
			this.time = t;
			this.then = t;
			this.update(t);
		});

		client.on('shader-update', () => {
			this.renders.forEach((render) => {
				const { sketch } = render;
				if (sketch.framerate === 0) {
					render.renderSketch();
				}
			});
		});
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

	async findRenderer({ renderingMode, customRenderer }) {
		if (this.renderers[renderingMode])
			return this.renderers[renderingMode].instance;

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

	update(now) {
		const deltaTime = now - this.then;
		this.then = now;

		if (!this.paused) {
			for (let i = 0; i < this.renders.length; i++) {
				this.renders[i].loop({ time: this.time, deltaTime });
			}

			this.time += deltaTime;
		}

		this.raf = requestAnimationFrame((t) => this.update(t));
	}

	async mount(id, container, sketch) {
		let canvas = this.createCanvas({ container, context: sketch.key });

		const renderer = await this.findRenderer({
			renderingMode: sketch.instance.rendering,
		});

		const { width, height, pixelRatio } = this;

		let mountParams = {};

		if (renderer) {
			mountParams = renderer?.onMountPreview?.({
				id,
				canvas,
				container,
				width,
				height,
				pixelRatio,
			});
		}

		if (mountParams.canvas !== canvas) {
			canvas = this.createCanvas({
				container,
				canvas: mountParams.canvas,
				context: sketch.key,
			});
		}

		let params = {
			...mountParams,
			id,
			canvas,
			container,
			publicPath: `@fs${__CWD__}`,
			width,
			height,
			pixelRatio,
			props: sketch.instance.props,
		};

		try {
			await sketch.load(params);
			await sketch.setup(params);

			const render = new Render({
				id,
				container,
				params,
				canvas,
				sketch,
				renderer,
			});

			this.renders.push(render);
		} catch (error) {
			console.error(error);
			displayError(error, sketch.key);
		}
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

		if (this.resizing === SIZES.SCALE) {
			canvas.style.transform = `scale(${this.scale})`;
		} else {
			canvas.style.transform = null;
		}

		if (container) {
			container.appendChild(canvas);
		}

		return canvas;
	}

	reset() {
		this.renders.forEach((render) => {
			const { id, sketch, container } = render;
			this.unmount(id);
			sketch.reset();
			this.mount(id, container, sketch);
		});
	}

	destroyCanvas(canvas) {
		if (canvas) {
			canvas.parentNode?.removeChild(canvas);
			canvas.onmousedown = null;
			canvas.onmousemove = null;
			canvas.onmouseup = null;
			canvas.onclick = null;
			canvas = null;
		}
	}

	unmount(renderId) {
		const index = this.renders.findIndex(
			(render) => render.id === renderId,
		);
		const render = this.renders[index];
		if (render) {
			const { id, canvas, renderer, sketch } = render;
			renderer?.onDestroyPreview?.({ id });

			this.destroyCanvas(canvas);

			clearError(sketch.key);

			sketch?.instance?.dispose?.();

			this.renders.splice(index, 1);
		}
	}

	unmountFromKey(key) {
		clearError(key);

		this.renders.forEach((render) => {
			const { id, sketch } = render;

			if (sketch.key === key) {
				this.unmount(id);
			}
		});
	}

	invalidate(key) {
		this.renders.forEach((render) => {
			const { sketch } = render;

			if (sketch.key === key && sketch.framerate === 0) {
				render.time = 0;
				render.elapsed = 0;
			}
		});
	}

	async screenshot() {
		this.paused = true;

		for (let i = 0; i < this.renders.length; i++) {
			const render = this.renders[i];
			const { sketch } = render;

			await exports.screenshot(render.canvas, {
				filename: sketch.key,
				pattern: sketch.filenamePattern,
				exportDir: sketch.exportDir,
				params: {
					props: sketch.props,
				},
				onBeforeCapture: (params) => {
					sketch.beforeCapture.forEach((fn) => fn(params));
					render.renderSketch();
				},
				onAfterCapture: (params) => {
					sketch.afterCapture.forEach((fn) => fn(params));
					render.renderSketch();
				},
			});
		}

		this.paused = false;
	}

	async startRecording() {
		this.paused = true;
		this.recording = true;

		for (let i = 0; i < this.renders.length; i++) {
			const render = this.renders[i];
			const { sketch } = render;

			render.record = await exports.record(render.canvas, {
				filename: sketch.key,
				pattern: sketch.filenamePattern,
				exportDir: sketch.exportDir,
				duration: sketch.duration,
				params: {
					props: sketch.props,
				},
				onStart: (params) => {
					render.time = 0;
					render.elapsed = 0;
					sketch.beforeRecord.forEach((fn) => fn(params));
				},
				onTick: ({ time, deltaTime }) => {
					render.loop({ time, deltaTime });
				},
				onComplete: (params) => {
					sketch.afterRecord.forEach((fn) => fn(params));
					render.record = null;
				},
			});
		}
	}

	stopRecording() {
		for (let i = 0; i < this.renders.length; i++) {
			const render = this.renders[i];

			render.record?.stop();
		}

		this.recording = false;
		this.paused = false;
	}

	override(config) {
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
}

export let rendering = new Rendering();
