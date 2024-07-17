import { PRESET_ORIENTATIONS } from '../lib/presets';
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
	sketches = $state([]);
	renderers = $state({});

	constructor() {
		this.key = 'rendering';
		this.now = performance.now();
		this.then = this.now;
		this.deltaTime = 0;
		this.elapsed = 0;

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
				$effect(() => {
					// const { width, height, pixelRatio, resizing, scale } =
					// 	rendering;
					// if (this.sketches.length > 0) {
					// 	console.log('Resize sketches', this.sketches.length);
					// 	this.sketches.forEach(
					// 		async ({
					// 			id,
					// 			canvas,
					// 			container,
					// 			sketch,
					// 			params,
					// 		}) => {
					// 			const renderer = await this.getRenderer(sketch);
					// 			params.width = width;
					// 			params.height = height;
					// 			params.pixelRatio = pixelRatio;
					// 			if (
					// 				renderer &&
					// 				typeof renderer.onResizePreview ===
					// 					'function'
					// 			) {
					// 				console.log(
					// 					'Renderer :: onResizePreview',
					// 					params,
					// 				);
					// 				renderer.onResizePreview(params);
					// 			}
					// 			if (canvas) {
					// 				if (resizing === SIZES.SCALE) {
					// 					canvas.style.transform = `scale(${scale})`;
					// 				} else {
					// 					canvas.style.transform = null;
					// 				}
					// 			}
					// 			sketch.resize?.({
					// 				...params,
					// 				width,
					// 				height,
					// 				pixelRatio,
					// 			});
					// 		},
					// 	);
					// }
				});
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

	async findRenderer({ rendering: renderingMode, renderer: customRenderer }) {
		if (this.renderers[renderingMode])
			return this.renderers[renderingMode].instance;

		// load and save
		const instance = customRenderer
			? typeof customRenderer === 'function'
				? await customRenderer()
				: customRenderer
			: await this.loadRenderer(renderingMode);

		const params = instance.init({
			canvas: document.createElement('canvas'),
			pixelRatio: rendering.pixelRatio,
			width: rendering.width,
			height: rendering.height,
		});

		this.renderers[renderingMode] = {
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
			this.elapsed += this.deltaTime;

			const timeParams = {
				time: this.elapsed,
				deltaTime: this.deltaTime,
			};

			for (let i = 0; i < this.sketches.length; i++) {
				const { params, sketch } = this.sketches[i];

				sketch.draw({
					...timeParams,
					...params,
				});
			}
		} else {
			this.lastTime = this.now;
		}

		this.raf = requestAnimationFrame(() => this.update());
	}

	async mount(id, container, sketch) {
		let canvas = this.createCanvas({ container });

		const renderer = await this.findRenderer({
			rendering: sketch.instance.rendering,
			renderer: sketch.instance.renderer,
		});

		// let mountParams = {};

		// const { width, height, pixelRatio } = this;

		// if (renderer && typeof renderer.onMountPreview === 'function') {
		// 	mountParams = renderer.onMountPreview({
		// 		id,
		// 		canvas,
		// 		container,
		// 		width,
		// 		height,
		// 		pixelRatio,
		// 	});

		// 	if (mountParams?.canvas !== canvas) {
		// 		this.destroyCanvas();
		// 		canvas = this.createCanvas({
		// 			container,
		// 			canvas: mountParams.canvas,
		// 		});
		// 	}
		// }

		// let params = {
		// 	...mountParams,
		// 	id,
		// 	canvas,
		// 	container,
		// 	publicPath: `@fs${__CWD__}`,
		// 	width,
		// 	height,
		// 	pixelRatio,
		// 	props: sketch.instance.props,
		// };

		// try {
		// 	await sketch.load(params);
		// 	await sketch.setup(params);

		// 	this.sketches.push({ id, container, canvas, params, sketch });
		// } catch (error) {
		// 	console.error(error);
		// 	displayError(error, this.key);
		// }
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
		console.log('Rendering :: unmount', id);
		this.sketches.splice(
			sketches.findIndex((s) => s.id === id),
			1,
		);
	}
}

export let rendering = new Rendering();
