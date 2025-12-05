import { screenshotCanvas, recordCanvas } from '../utils/canvas.utils';
import { hydrate, persist } from './utils.svelte';

export const IMAGE_ENCODINGS = ['png', 'jpeg', 'webp'];

export const VIDEO_FORMATS = {
	FRAMES: 'frames',
	MP4: 'mp4',
	WEBM: 'webm',
	GIF: 'gif',
	MKV: 'mkv',
	MOV: 'mov',
};

export const VIDEO_CODECS = {
	AVC: 'avc',
	HEVC: 'hevc',
	VP8: 'vp8',
	VP9: 'vp9',
	AV1: 'av1',
};

export const VIDEO_CODECS_FORMATS = new Map();
VIDEO_CODECS_FORMATS.set(VIDEO_CODECS.AVC, ['mp4', 'mkv', 'mov']);
VIDEO_CODECS_FORMATS.set(VIDEO_CODECS.HEVC, ['mp4', 'mkv', 'mov']);
VIDEO_CODECS_FORMATS.set(VIDEO_CODECS.VP8, ['webm', 'mkv']);
VIDEO_CODECS_FORMATS.set(VIDEO_CODECS.VP9, ['webm', 'mkv']);
VIDEO_CODECS_FORMATS.set(VIDEO_CODECS.AV1, ['webm', 'mkv']);

/**
 * List valid codecs based on format
 * @param {string} format
 * @return {string[]}
 */
export function getCodecsForFormat(format) {
	const codecs = [];

	for (const [codec, formats] of VIDEO_CODECS_FORMATS) {
		if (formats.includes(format)) {
			codecs.push(codec);
		}
	}

	return codecs;
}

class Exports {
	imageEncoding = $state(IMAGE_ENCODINGS[0]);
	videoFormat = $state(VIDEO_FORMATS.MP4);
	pixelsPerInch = $state(72);
	framerate = $state(60);
	useDuration = $state(true);
	duration = $state(1);
	loopCount = $state(1);
	imageQuality = $state(100);
	videoQuality = $state(100);
	videoCodec = $state(VIDEO_CODECS.HEVC);
	imageCount = $state(1);
	recording = $state(false);
	capturing = $state(false);
	imageCollapsed = $state(false);
	videoCollapsed = $state(false);

	constructor() {
		this.key = `exports`;
		$effect.root(() => {
			$effect(() => {
				if (!__BUILD__) {
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
						videoCodec: this.videoCodec,
						imageCount: this.imageCount,
						videoCollapsed: this.videoCollapsed,
						imageCollapsed: this.imageCollapsed,
					});
				}
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

	record(
		canvas,
		{
			framerate = this.framerate,
			format = this.videoFormat,
			imageEncoding = this.imageEncoding,
			quality = this.videoQuality,
			codec = this.videoCodec,
			duration,
			filename,
			pattern,
			exportDir,
			params = {},
			onStart = () => {},
			onTick = () => {},
			onComplete = () => {},
			onBeforeRecord = () => {},
			onAfterRecord = () => {},
		},
	) {
		const recordParams = {
			framerate,
			format,
			imageEncoding,
			quality,
			duration,
		};

		return recordCanvas(canvas, {
			params,
			filename,
			exportDir,
			pattern,
			onTick,
			framerate,
			format,
			codec,
			imageEncoding,
			quality,
			duration: duration * this.loopCount,
			onStart: () => {
				onStart(recordParams);
				onBeforeRecord(recordParams);
			},
			onComplete: () => {
				this.recording = false;
				onAfterRecord(recordParams);
				onComplete(recordParams);
			},
		});
	}
}

export let exports = new Exports();
