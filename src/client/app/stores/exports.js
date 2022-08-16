import { writable } from "svelte/store";
import { createPersistentStore } from "./utils";

export const IMAGE_ENCODINGS = ["png", "jpeg", "webp"];

export const VIDEO_FORMATS = {
	FRAMES: "frames",
	MP4: "mp4",
	GIF: "gif",
	WEBM: "webm",
};

export const exports = createPersistentStore(`exports`, false, {
	quality: 0.92,
	imageEncoding: IMAGE_ENCODINGS[0],
	videoFormat: Object.values(VIDEO_FORMATS)[0],
	pixelsPerInch: 72,
	framerate: 60,
	useDuration: true,
	loopCount: 1,
	videoQuality: 100,
});

export const recording = writable(false);
