import { rendering } from './state/rendering.svelte';
import { sketchesManager } from './state/sketches.svelte';
import { getContext } from './triggers/shared';

export let onBeforeCapture = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onBeforeCapture(listener);
};

export let onAfterCapture = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onAfterCapture(listener);
};

export let onBeforeRecord = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onBeforeRecord(listener);
};

export let onAfterRecord = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onAfterRecord(listener);
};

/**
 * Screenshot the sketch it is called from
 * @param {object} options
 * @param {string} [options.filename]
 * @param {function} [options.pattern]
 * @param {exportDir} [options.pattern ]
 */
export async function screenshot({ filename, pattern, exportDir } = {}) {
	const context = getContext();

	const renders = rendering.renders.filter(
		(render) => render.sketch.key === context,
	);

	if (renders.length > 0) {
		for (let i = 0; i < renders.length; i++) {
			await renders[i].screenshot({
				filename,
				pattern,
				exportDir,
			});
		}
	}
}
