import { PRESET_ORIENTATIONS } from '../lib/presets';
import { map } from '../utils/math.utils.js';
import { clearError, displayError } from './errors.svelte.js';
import { exports } from './exports.svelte.js';
import { persist, hydrate } from './utils.svelte';

export const SIZES = {
	FIXED: 'fixed',
	PRESET: 'preset',
	ASPECT_RATIO: 'aspect-ratio',
	WINDOW: 'window',
	SCALE: 'scale',
};

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
	renders = $state({});

	constructor() {
		this.key = 'rendering';
		this.now = performance.now();
		this.then = this.now;
		this.deltaTime = 0;
		this.elapsed = 0;
		this.renderers = {};

		$effect.root(() => {
			$effect(() => {
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
				const ids = Object.keys(this.renders);

				if (ids.length > 0) {
					ids.forEach((id) => {
						const { sketch, renderer, params } = this.renders[id];

						params.width = width;
						params.height = height;
						params.pixelRatio = pixelRatio;

						renderer?.onResizePreview?.(params);

						sketch.resize?.(params);
					});
				}
			});

			$effect(() => {
				const ids = Object.keys(this.renders);

				if (ids.length > 0) {
					ids.forEach((id) => {
						const { sketch, renderer, params } = this.renders[id];

						if (sketch.framerate === 0 && sketch.props) {
							console.log('rerender ??');
						}
					});
				}
			});
		});

		hydrate(this.key, this);

		this.update();
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

	update() {
		this.now = performance.now();
		this.deltaTime = this.now - this.then;
		this.then = this.now;

		if (!this.paused) {
			const ids = Object.keys(this.renders);

			for (let i = 0; i < ids.length; i++) {
				const id = ids[i];

				this.renders[id].loop({ deltaTime: this.deltaTime });
			}

			this.elapsed += this.deltaTime;
		} else {
			this.lastTime = this.now;
		}

		this.raf = requestAnimationFrame(() => this.update());
	}

	async mount(id, container, sketch) {
		let canvas = this.createCanvas({ container });

		const renderer = await this.findRenderer({
			renderingMode: sketch.instance.rendering,
		});

		const { width, height, pixelRatio } = this;

		let mountParams = renderer?.onMountPreview?.({
			id,
			canvas,
			container,
			width,
			height,
			pixelRatio,
		});

		if (mountParams?.canvas !== canvas) {
			this.destroyCanvas();
			canvas = this.createCanvas({
				container,
				canvas: mountParams.canvas,
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

		let elapsed = 0;

		try {
			await sketch.load(params);
			await sketch.setup(params);

			const { duration, framerate } = sketch;

			let frameLength = (1 / framerate) * 1000;
			let frameCount = framerate * duration;
			let interval = 1 / frameCount;
			let time = 0;
			let elapsed = 0;

			const render = {
				container,
				params,
				canvas,
				sketch,
				renderer,
				elapsed,
				time,
				elapsed,
			};

			render.loop = ({ deltaTime = 0 } = {}) => {
				let { elapsed, time } = render;
				let playhead = time / 1000 / duration;
				playhead %= 1;
				playhead = Math.floor(playhead / interval) * interval;
				let playcount = Math.floor(time / 1000 / duration);
				let frame = Math.floor(map(playhead, 0, 1, 1, frameCount + 1));

				if (elapsed === 0 || elapsed >= frameLength) {
					render.elapsed = 0;
					try {
						renderer?.onBeforeUpdatePreview?.({ id });

						sketch.draw({
							...params,
							time: elapsed,
							deltaTime,
							playhead,
							playcount,
							frame,
						});

						renderer?.onAfterUpdatePreview?.({ id });
					} catch (error) {
						displayError(error, sketch.key);
					}
				}

				render.time += deltaTime;
				render.elapsed += deltaTime;
			};

			Object.assign(this.renders, {
				[id]: render,
			});
		} catch (error) {
			console.error(error);
			displayError(error, sketch.key);
		}
	}

	createCanvas({ container, canvas = document.createElement('canvas') }) {
		// canvas.onmousedown = (event) => checkForTriggersDown(event, key);
		// canvas.onmousemove = (event) => checkForTriggersMove(event, key);
		// canvas.onmouseup = (event) => checkForTriggersUp(event, key);
		// canvas.onclick = (event) => checkForTriggersClick(event, key);

		if (container) {
			container.appendChild(canvas);
		}

		return canvas;
	}

	reset() {
		Object.keys(this.renders).forEach((id) => {
			const { sketch, container } = this.renders[id];
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

	unmount(id) {
		if (this.renders[id]) {
			const { canvas, renderer, sketch } = this.renders[id] ?? {};
			renderer?.onDestroyPreview?.({ id });

			this.destroyCanvas(canvas);

			clearError(sketch.key);

			sketch?.instance?.dispose?.();
			delete this.renders[id];
		}
	}

	unmountFromKey(key) {
		clearError(key);

		Object.keys(this.renders).forEach((id) => {
			const { sketch } = this.renders[id];

			if (sketch.key === key) {
				this.unmount(id);
			}
		});
	}

	invalidate(key) {
		Object.keys(this.renders).forEach((id) => {
			const render = this.renders[id];
			const { sketch } = render;

			if (sketch.key === key && sketch.framerate === 0) {
				render.time = 0;
				render.elapsed = 0;
			}
		});
	}

	async screenshot() {
		this.paused = true;

		const ids = Object.keys(this.renders);

		for (let i = 0; i < ids.length; i++) {
			const render = this.renders[ids[i]];
			const { sketch } = render;

			await exports.screenshot(render.canvas, {
				filename: sketch.key,
				pattern: sketch?.filenamePattern,
				exportDir: sketch?.exportDir,
				params: {
					props: sketch?.props,
				},
				onBeforeCapture: (params) => {
					sketch.beforeCapture.forEach((fn) => fn(params));
					render.loop();
				},
				onAfterCapture: (params) => {
					sketch.afterCapture.forEach((fn) => fn(params));
					render.loop();
				},
			});
		}

		this.paused = false;
	}
}

export let rendering = new Rendering();
