import { current as currentRendering } from "./rendering";
import { on, TRANSITION_CHANGE } from "../events";

export let renderers = {};

function loadRenderer(rendering) {
	if (rendering === "three") {
		return import(/* @vite-ignore */"../renderers/THREERenderer.js");
	}

	if (rendering === "fragment") {
		return import(/* @vite-ignore */"../renderers/FragmentRenderer.js");
	}

	if (rendering === "p5") {
		return import(/* @vite-ignore */"../renderers/P5Renderer.js");
	}

	return import(/* @vite-ignore */"../renderers/2DRenderer.js");
}

export async function findRenderer(rendering) {
	if (renderers[rendering]) return renderers[rendering];

	// load and save
	renderers[rendering] = await loadRenderer(rendering);

	// get
	let renderer = renderers[rendering];
	let initialized = false;

	currentRendering.subscribe((current) => {
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

			let events = [
				{ name: "onTransitionChange", event: TRANSITION_CHANGE },
			];

			events.forEach(({ name, event }) => {
			    if (typeof renderer[`${name}`] === "function") {
			        on(event, (event) => {
			            renderer[`${name}`]({
							...event,
							width: current.width,
							height: current.height,
							pixelRatio: current.pixelRatio,
						});
			        });
			    }
			});
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
