import { rendering } from './state/rendering.svelte';
import { sketchesManager } from './state/sketches.svelte';
import { getContext } from './triggers/shared';

/**
 * Register a callback to be called before capturing
 * @param {Function} listener - The callback function to execute before capture
 * @param {string} [context] - The sketch context (defaults to current context)
 * @returns {void}
 */
export const onBeforeCapture = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onBeforeCapture(listener);
};

/**
 * Register a callback to be called after capturing
 * @param {Function} listener - The callback function to execute after capture
 * @param {string} [context] - The sketch context (defaults to current context)
 * @returns {void}
 */
export const onAfterCapture = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onAfterCapture(listener);
};

/**
 * Register a callback to be called before recording
 * @param {Function} listener - The callback function to execute before recording
 * @param {string} [context] - The sketch context (defaults to current context)
 * @returns {void}
 */
export const onBeforeRecord = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onBeforeRecord(listener);
};

/**
 * Register a callback to be called after recording
 * @param {Function} listener - The callback function to execute after recording
 * @param {string} [context] - The sketch context (defaults to current context)
 * @returns {void}
 */
export const onAfterRecord = (listener, context = getContext()) => {
	sketchesManager.sketches[context]?.onAfterRecord(listener);
};

/**
 * Screenshot the sketch it is called from
 * @param {object} options
 * @param {string} [options.filename]
 * @param {function} [options.pattern]
 * @param {string} [options.exportDir]
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
