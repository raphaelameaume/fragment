import { screenshotCanvas } from '../utils/canvas.utils';
import { hydrate, persist } from './utils.svelte';

export const IMAGE_ENCODINGS = ['png', 'jpeg', 'webp'];

export const VIDEO_FORMATS = {
	FRAMES: 'frames',
	MP4: 'mp4',
	GIF: 'gif',
	WEBM: 'webm',
};

class Exports {
	imageEncoding = $state(IMAGE_ENCODINGS[0]);
	videoFormat = $state(Object.values(VIDEO_FORMATS)[0]);
	pixelsPerInch = $state(72);
	framerate = $state(60);
	useDuration = $state(true);
	duration = $state(1);
	loopCount = $state(1);
	imageQuality = $state(100);
	videoQuality = $state(100);
	imageCount = $state(1);
	recording = $state(false);
	capturing = $state(false);
	imageCollapsed = $state(false);
	videoCollapsed = $state(false);

	constructor() {
		this.key = `exports`;
		$effect.root(() => {
			$effect(() => {
				persist(this.key, {
					imageEncoding: this.imageEncoding,
					videoFormat: this.videoFormat,
					pixelsPerInch: this.pixelsPerInch,
					framerate: this.framerate,
					useDuration: this.useDuration,
					duration: this.duration,
					loopCount: this.loopCount,
					imageQuality: this.imageQuality,
					videoQuality: this.videoQuality,
					imageCount: this.imageCount,
					videoCollapsed: this.videoCollapsed,
					imageCollapsed: this.imageCollapsed,
				});
			});
		});

		hydrate(this.key, this);
	}

	async screenshot(
		canvas,
		{
			count = this.imageCount,
			encoding = this.imageEncoding,
			quality = this.imageQuality,
			pixelsPerInch = this.pixelsPerInch,
			filename,
			pattern,
			exportDir,
			params = {},
			onStart = () => {},
			onComplete = () => {},
			onBeforeCapture = () => {},
			onAfterCapture = () => {},
		} = {},
	) {
		const captureParams = {
			encoding,
			quality,
			pixelsPerInch,
			count,
		};

		onStart(captureParams);

		for (let i = 0; i < count; i++) {
			onBeforeCapture(captureParams);

			await screenshotCanvas(canvas, {
				filename,
				pattern,
				exportDir,
				index: count > 1 ? i : undefined,
				params,
				encoding,
				quality,
				pixelsPerInch,
			});

			onAfterCapture(captureParams);
		}

		onComplete(captureParams);
	}
}

export let exports = new Exports();
