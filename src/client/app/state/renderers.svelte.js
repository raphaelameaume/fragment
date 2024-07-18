import { rendering } from './rendering.svelte';

export let renderers = $state({});

$effect.root(() => {
	$effect(() => {
		const { width, height, pixelRatio } = rendering;
		console.log('resize renderers', Object.keys(renderers));

		Object.keys(renderers).forEach((key) => {
			const { instance, params } = renderers[key];

			instance.resize?.({
				width,
				height,
				pixelRatio,
				...params,
			});
		});
	});
});

function loadRenderer(renderingMode) {
	if (renderers[renderingMode]) return renderers[renderingMode];

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

export async function findRenderer({ renderingMode, customRenderer }) {
	let rendererModule = customRenderer
		? typeof customRenderer === 'function'
			? await customRenderer()
			: customRenderer
		: await loadRenderer(renderingMode);

	if (rendererModule === renderers[renderingMode]) {
		return rendererModule;
	}

	let params = {};

	if (typeof rendererModule.init === 'function') {
		let initParams = rendererModule.init({
			canvas: document.createElement('canvas'),
			pixelRatio: rendering.pixelRatio,
			width: rendering.width,
			height: rendering.height,
		});

		Object.assign(params, initParams);
	}

	// load and save
	renderers[renderingMode] = {
		instance: rendererModule,
		params,
	};

	return rendererModule;
}
