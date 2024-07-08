export const IMAGE_ENCODINGS = ['png', 'jpeg', 'webp'];

export const VIDEO_FORMATS = {
	FRAMES: 'frames',
	MP4: 'mp4',
	GIF: 'gif',
	WEBM: 'webm',
};

export const exports = $state({
	imageEncoding: IMAGE_ENCODINGS[0],
	videoFormat: Object.values(VIDEO_FORMATS)[0],
	pixelsPerInch: 72,
	framerate: 60,
	useDuration: true,
	duration: 1,
	loopCount: 1,
	imageQuality: 100,
	videoQuality: 100,
	imageCount: 1,
});

function createRecording() {
	let isActive = $state(false);

	function toggle() {
		isActive = !isActive;
	}

	return {
		get isActive() {
			return isActive;
		},
		toggle,
	};
}

export let recording = createRecording();

function createCapturing() {
	let isActive = $state(false);

	function toggle() {
		isActive = !isActive;
	}

	return {
		get isActive() {
			return isActive;
		},
		toggle,
	};
}

export let capturing = createCapturing();
