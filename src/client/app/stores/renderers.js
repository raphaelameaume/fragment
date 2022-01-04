import { current as currentRendering } from "./rendering";
import { on, PREVIEW_AFTER_UPDATE, PREVIEW_BEFORE_UPDATE, PREVIEW_MOUNT, TRANSITION_CHANGE } from "../events";

export let renderers = {};

function loadRenderer(rendering) {
	if (rendering === "three") {
		return import(/* @vite-ignore */"../renderers/THREERenderer.js");
	}

	return import("../renderers/2DRenderer.js");
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
			r = renderer.init({
				canvas: document.createElement('canvas'),
				pixelRatio: current.pixelRatio,
				width: current.width,
				height: current.height,
			});

			let events = [
				{ name: "onTransitionChange", event: TRANSITION_CHANGE },
				{ name: "onMountPreview", event: PREVIEW_MOUNT },
				{ name: "onBeforeUpdatePreview", event: PREVIEW_BEFORE_UPDATE },
				{ name: "onAfterUpdatePreview", event: PREVIEW_AFTER_UPDATE },
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

		renderer.resize({
			width: current.width,
			height: current.height,
			pixelRatio: current.pixelRatio,
			...r,
		});
	});

	return renderer;
}
