import { writable } from 'svelte/store';
import { createStore } from './utils';

export const IMAGE_ENCODINGS = ['png', 'jpeg', 'webp'];

export const VIDEO_FORMATS = {
	FRAMES: 'frames',
	MP4: 'mp4',
	GIF: 'gif',
	WEBM: 'webm',
	MP4_WEBCODEC: 'mp4 (webcodec)',
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
	},
	{
		persist: !__BUILD__,
		reset: false,
	},
);

export const recording = writable(false);
export const capturing = writable(false);
