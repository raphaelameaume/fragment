import { sketchesManager } from './state/sketches.svelte';

import { getContext } from './triggers/shared';

// export {
// 	onBeforeCapture,
// 	onAfterCapture,
// 	onBeforeRecord,
// 	onAfterRecord,
// } from './stores/exports';

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
