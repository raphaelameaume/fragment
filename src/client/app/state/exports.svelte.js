import { saveFiles } from '@fragment/utils/file.utils';
import { screenshotCanvas, recordCanvas } from '../utils/canvas.utils';
import { hydrate, persist } from './utils.svelte';

/**
 * @typedef {'png' | 'jpeg' | 'webp'} ImageEncoding
 */

/**
 * @typedef {'frames'|'mp4' | 'webm' | 'gif' | 'mkv' | 'mov' } VideoFormat
 */

/** @typedef CaptureParams
 * @property {ImageEncoding} encoding
 * @property {number} quality
 * @property {number} pixelsPerInch
 * @property {number} count
 */

/** @typedef RecordParams
 * @property {number} framerate,
 * @property {string} format,
 * @property {ImageEncoding} imageEncoding,
 * @property {number} quality,
 * @property {number|undefined} duration,
 */

/** @callback CaptureListener
 * @param {CaptureParams} params
 */

/** @callback RecordListener
 * @param {RecordParams} params
 */

/** @type {ImageEncoding[]} */
export const IMAGE_ENCODINGS = ['png', 'jpeg', 'webp'];

/** @type {Record<string, VideoFormat>} */
export const VIDEO_FORMATS = {
	FRAMES: 'frames',
	MP4: 'mp4',
	WEBM: 'webm',
	GIF: 'gif',
	MKV: 'mkv',
	MOV: 'mov',
};

/** @type {Record<string, import('../lib/canvas-recorder/MediaBunnyRecorder').VideoCodec>} */
export const VIDEO_CODECS = {
	AVC: 'avc',
	HEVC: 'hevc',
	VP8: 'vp8',
	VP9: 'vp9',
	AV1: 'av1',
};

/** @type {Map<import('../lib/canvas-recorder/MediaBunnyRecorder').VideoCodec, string[]>} */
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
	/** @type {VideoFormat} */
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
	committing = $state(false);
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

	/**
	 *
	 * @param {HTMLCanvasElement} canvas
	 * @param {object} [options]
	 * @param {number} [options.count]
	 * @param {ImageEncoding} [options.encoding]
	 * @param {number} [options.quality]
	 * @param {number} [options.pixelsPerInch]
	 * @param {string} [options.filename]
	 * @param {File[]} [options.files]
	 * @param {boolean} [options.commit]
	 * @param {import('../utils/canvas.utils').FilenamePattern} [options.pattern]
	 * @param {string} [options.exportDir]
	 * @param {Record<any, any>} [options.params]
	 * @param {CaptureListener} [options.onStart]
	 * @param {CaptureListener} [options.onComplete]
	 * @param {CaptureListener} [options.onBeforeCapture]
	 * @param {CaptureListener} [options.onAfterCapture]
	 */
	async screenshot(
		canvas,
		{
			count = this.imageCount,
			encoding = this.imageEncoding,
			quality = this.imageQuality,
			pixelsPerInch = this.pixelsPerInch,
			filename,
			files = [],
			commit = false,
			pattern,
			exportDir,
			params = {},
			onStart = () => {},
			onComplete = () => {},
			onBeforeCapture = () => {},
			onAfterCapture = () => {},
		} = {},
	) {
		/** @type {CaptureParams} */
		const captureParams = {
			encoding,
			quality,
			pixelsPerInch,
			count,
		};

		onStart?.(captureParams);

		for (let i = 0; i < count; i++) {
			onBeforeCapture?.(captureParams);

			const file = screenshotCanvas(canvas, {
				filename,
				pattern,
				exportDir,
				index: count > 1 ? i : undefined,
				params,
				encoding,
				quality,
				pixelsPerInch,
			});

			files.push(file);

			onAfterCapture?.(captureParams);
		}

		onComplete?.(captureParams);

		try {
			await saveFiles(files, [], { commit });
		} catch (error) {
			console.error(`[fragment] Error while saving screenshot.`);
			console.log(error);
		}
	}

	/**
	 *
	 * @param {HTMLCanvasElement} canvas
	 * @param {object} options
	 * @param {number} [options.framerate]
	 * @param {VideoFormat} [options.format]
	 * @param {ImageEncoding} [options.imageEncoding]
	 * @param {number} [options.quality]
	 * @param {number} [options.duration]
	 * @param {string} [options.filename]
	 * @param {import('../utils/canvas.utils').FilenamePattern} [options.pattern]
	 * @param {string} [options.exportDir]
	 * @param {Record<any, any>} [options.params]
	 * @param {import('@fragment/lib/canvas-recorder/MediaBunnyRecorder').VideoCodec} [options.codec]
	 * @param {RecordListener} [options.onStart]
	 * @param {RecordListener} [options.onComplete]
	 * @param {RecordListener} [options.onBeforeRecord]
	 * @param {RecordListener} [options.onAfterRecord]
	 * @param {(params: { time: number, deltaTime: number }) => void} [options.onTick]
	 */
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
		/** @type RecordParams */
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
			duration:
				duration !== undefined ? duration * this.loopCount : undefined,
			onStart: () => {
				onStart?.(recordParams);
				onBeforeRecord?.(recordParams);
			},
			onComplete: () => {
				this.recording = false;
				onAfterRecord?.(recordParams);
				onComplete?.(recordParams);
			},
		});
	}
}

export let exports = new Exports();
