import { writable } from "svelte/store";
import { keepInSync, rehydrate } from "./utils";

export const IMAGE_ENCODINGS = ["png", "jpeg", "webp"];
export const VIDEO_FORMATS = [".mp4", ".gif", ".webm"];

export const exports = writable({
	...rehydrate(`fragment.exports`, {
		quality: 0.92,
		imageEncoding: IMAGE_ENCODINGS[0],
		videoFormat: VIDEO_FORMATS[0],
		pixelsPerInch: 72,
		framerate: 60,
		useDuration: true,
	}, false)
});

keepInSync(`fragment.exports`, exports);
