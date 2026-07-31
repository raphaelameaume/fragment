import { rendering } from './state/rendering.svelte';
import { sketchesManager } from './state/sketches.svelte';
import { getContext } from './triggers/shared';

/**
 * Register a callback to be called before capturing
 * @param {(params: import('./state/exports.svelte').CaptureParams) => void} listener - The callback function to execute before capture
 * @param {string} [context] - The sketch context (defaults to current context)
 */
export const onBeforeCapture = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onBeforeCapture(listener);
};

/**
 * Register a callback to be called after capturing
 * @param {(params: import('./state/exports.svelte').CaptureParams) => void} listener - The callback function to execute after capture
 * @param {string} [context] - The sketch context (defaults to current context)
 */
export const onAfterCapture = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onAfterCapture(listener);
};

/**
 * Register a callback to be called before recording
 * @param {(params: import('./state/exports.svelte').RecordParams) => void} listener - The callback function to execute before recording
 * @param {string} [context] - The sketch context (defaults to current context)
 */
export const onBeforeRecord = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onBeforeRecord(listener);
};

/**
 * Register a callback to be called after recording
 * @param {(params: import('./state/exports.svelte').RecordParams) => void} listener - The callback function to execute after recording
 * @param {string} [context] - The sketch context (defaults to current context)
 */
export const onAfterRecord = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onAfterRecord(listener);
};

/**
 * Screenshot the sketch it is called from
 * @param {object} options
 * @param {string} [options.filename]
 * @param {import('./utils/canvas.utils').FilenamePattern} [options.pattern]
 * @param {string} [options.exportDir]
 * @param {number} [options.quality]
 */
export async function screenshot({
	filename,
	pattern,
	exportDir,
	quality,
} = {}) {
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
				quality,
			});
		}
	}
}
