import { rendering } from "./rendering";

export let renderers = {};

function loadRenderer(renderingMode = "2d") {
	if (__THREE_RENDERER__ && renderingMode === "three") {
		return import("../renderers/THREERenderer.js");
	}

	if (__FRAGMENT_RENDERER__ && renderingMode === "fragment") {
		return import("../renderers/FragmentRenderer.js");
	}

	if (__P5_RENDERER__ && renderingMode === "p5") {
		return import("../renderers/P5Renderer.js");
	}

	if (__2D_RENDERER__ && renderingMode === "2d") {
		return import("../renderers/2DRenderer.js");
	}
}

export async function findRenderer(renderingMode = "2d") {
	if (renderers[renderingMode]) return renderers[renderingMode];

	// load and save
	renderers[renderingMode] = await loadRenderer(renderingMode);

	// get
	let renderer = renderers[renderingMode];
	let initialized = false;

	rendering.subscribe((current) => {
		let r;

		if (!initialized) {
			if (typeof renderer.init === "function") {
				r = renderer.init({
					canvas: document.createElement('canvas'),
					pixelRatio: current.pixelRatio,
					width: current.width,
					height: current.height,
				});
			}
		}

		initialized = true;

		if (typeof renderer.resize === "function") {
			renderer.resize({
				width: current.width,
				height: current.height,
				pixelRatio: current.pixelRatio,
				...r,
			});
		}
	});

	return renderer;
}
