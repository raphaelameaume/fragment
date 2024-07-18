import { PRESET_ORIENTATIONS } from '../lib/presets';
import { map } from '../utils/math.utils.js';
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
	sketches = $state({});

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
					paused: this.paused,
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
				const ids = Object.keys(this.sketches);

				if (ids.length > 0) {
					ids.forEach((id) => {
						const { sketch, renderer, params } = this.sketches[id];

						params.width = width;
						params.height = height;
						params.pixelRatio = pixelRatio;

						renderer?.onResizePreview?.(params);

						sketch.resize?.(params);
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
			const timeParams = {
				time: this.elapsed,
				deltaTime: this.deltaTime,
			};

			const ids = Object.keys(this.sketches);

			for (let i = 0; i < ids.length; i++) {
				const id = ids[i];
				const ref = this.sketches[id];
				const { params, sketch, renderer, elapsed } = ref;
				const { duration, framerate } = sketch;

				let frameLength = 1000 / framerate;
				let frameCount = framerate * duration;
				let interval = 1 / frameCount;
				let playhead = this.elapsed / 1000 / duration;
				playhead %= 1;
				playhead = Math.floor(playhead / interval) * interval;
				let playcount = Math.floor(this.elapsed / 1000 / duration);
				let frame = Math.floor(map(playhead, 0, 1, 1, frameCount + 1));

				const renderParams = {
					playhead,
					playcount,
					frame,
				};

				if (elapsed === 0 || elapsed >= (1 / framerate) * 1000) {
					ref.elapsed = 0;
					renderer?.onBeforeUpdatePreview?.({ id });

					sketch.draw({
						...timeParams,
						...renderParams,
						...params,
					});

					renderer?.onAfterUpdatePreview?.({ id });
				}

				ref.elapsed += this.deltaTime;
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

			Object.assign(this.sketches, {
				[id]: {
					container,
					params,
					canvas,
					sketch,
					renderer,
					elapsed,
				},
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

	destroyCanvas(canvas) {
		console.log('destroyCanvas', canvas);

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
		console.log(`Rendering :: unmount`, id);

		if (this.sketches[id]) {
			console.log(`unmount sketch`, this.sketches[id]);

			const { canvas, renderer, sketch } = this.sketches[id] ?? {};

			renderer?.onDestroyPreview?.({ id });
			this.destroyCanvas(canvas);

			sketch?.instance?.dispose?.();
			delete this.sketches[id];
		} else {
			console.log(`nothing to unmount`);
		}
	}
}

export let rendering = new Rendering();
