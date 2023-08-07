import {
	removeBeforeCaptureFrom,
	removeAfterCaptureFrom,
	removeBeforeRecordFrom,
	removeAfterRecordFrom,
} from './stores/exports';

export {
	onBeforeCapture,
	onAfterCapture,
	onBeforeRecord,
	onAfterRecord,
} from './stores/exports';

export function removeHooksFrom(context) {
	removeBeforeCaptureFrom(context);
	removeAfterCaptureFrom(context);
	removeBeforeRecordFrom(context);
	removeAfterRecordFrom(context);
}
