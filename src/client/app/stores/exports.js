import { writable } from 'svelte/store';
import { createHookStore, createStore } from './utils';

export const IMAGE_ENCODINGS = ['png', 'jpeg', 'webp'];

export const VIDEO_FORMATS = {
	FRAMES: 'frames',
	MP4: 'mp4',
	GIF: 'gif',
	WEBM: 'webm',
};

export const exports = createStore(
	`exports`,
	{
		imageEncoding: IMAGE_ENCODINGS[0],
		videoFormat: Object.values(VIDEO_FORMATS)[0],
		pixelsPerInch: 72,
		framerate: 60,
		useDuration: true,
		loopCount: 1,
		imageQuality: 100,
		videoQuality: 100,
		imageCount: 1,
	},
	{
		persist: !__BUILD__,
		reset: false,
	},
);

export const recording = writable(false);
export const capturing = writable(false);

export const [beforeCapture, onBeforeCapture, removeBeforeCaptureFrom] =
	createHookStore('onBeforeCapture');
export const [afterCapture, onAfterCapture, removeAfterCaptureFrom] =
	createHookStore('onAfterCapture');

export const [beforeRecord, onBeforeRecord, removeBeforeRecordFrom] =
	createHookStore('onBeforeRecord');

export const [afterRecord, onAfterRecord, removeAfterRecordFrom] =
	createHookStore('onAfterRecord');
