import CanvasRecorder from './CanvasRecorder.js';
import {
	Output,
	Mp4OutputFormat,
	MkvOutputFormat,
	MovOutputFormat,
	BufferTarget,
	CanvasSource,
	Quality,
	QUALITY_VERY_LOW,
	QUALITY_LOW,
	QUALITY_MEDIUM,
	QUALITY_HIGH,
	QUALITY_VERY_HIGH,
	WebMOutputFormat,
} from 'mediabunny';
import { map } from '@fragment/utils/math.utils.js';
import { VIDEO_FORMATS } from '@fragment/state/exports.svelte.js';

/**
 * @typedef {'avc' | 'hevc' | 'vp9' | 'av1' | 'vp8'} VideoCodec
 */

/**
 * @typedef {Object} MediaBunnyRecorderOptions
 * @property {VideoCodec} codec - Video codec to use
 * @property {number} [duration] - Recording duration in seconds
 * @property {number} [framerate] - Frames per second
 * @property {number} [quality] - Recording quality (1-100)
 * @property {string} format - Output format
 * @property {import('./CanvasRecorder').CanvasRecorderStartCallback} [onStart] - Callback when recording starts
 * @property {import('./CanvasRecorder').CanvasRecorderTickCallback} [onTick] - Callback on each frame
 * @property {import('./CanvasRecorder').CanvasRecorderCompleteCallback} [onComplete] - Callback when recording completes
 */

/**
 * Recorder that uses MediaBunny to encode video
 * @extends CanvasRecorder
 */
class MediaBunnyRecorder extends CanvasRecorder {
	/** @type Quality[] */
	static BITRATES = [
		QUALITY_VERY_LOW,
		QUALITY_LOW,
		QUALITY_MEDIUM,
		QUALITY_HIGH,
		QUALITY_VERY_HIGH,
	];

	/**
	 * Create a MediaBunny recorder
	 * @param {HTMLCanvasElement} canvas - The canvas to record
	 * @param {MediaBunnyRecorderOptions} options - Recording options
	 */
	constructor(canvas, { codec, ...options }) {
		super(canvas, options);

		/** @type {VideoCodec} */
		this.codec = codec;

		const outputFormats = new Map();
		outputFormats.set(VIDEO_FORMATS.MKV, MkvOutputFormat);
		outputFormats.set(VIDEO_FORMATS.MP4, Mp4OutputFormat);
		outputFormats.set(VIDEO_FORMATS.MOV, MovOutputFormat);
		outputFormats.set(VIDEO_FORMATS.WEBM, WebMOutputFormat);

		const outputFormat = outputFormats.get(this.format);

		/** @type {Output} */
		this.output = new Output({
			format: new outputFormat(),
			target: new BufferTarget(),
		});

		const { BITRATES } = MediaBunnyRecorder;

		const bitrate =
			BITRATES[
				Math.floor(map(this.quality, 1, 100, 0, BITRATES.length - 1))
			];

		/** @type {CanvasSource} */
		this.videoSource = new CanvasSource(this.canvas, {
			codec,
			bitrate,
		});

		this.output.addVideoTrack(this.videoSource, {
			frameRate: this.framerate,
		});
	}

	/**
	 * Load and start the output
	 * @returns {Promise<void>}
	 */
	async load() {
		await this.output.start();
	}

	/**
	 * Process a single frame
	 * @param {import('./CanvasRecorder').TickData} tickData - Frame data
	 * @returns {Promise<void>}
	 */
	async tick({ frameCount }) {
		const timestamp = frameCount / this.framerate;

		this.videoSource.add(timestamp, this.frameDuration / 1000);
	}

	/**
	 * End recording and create video blob
	 * @returns {Promise<void>}
	 */
	async end() {
		await this.output.finalize();

		const { mimeType } = this.output.format;
		const target = /** @type {BufferTarget} */ (this.output.target);
		const buffer = target.buffer;

		if (buffer) {
			this.result = new Blob([buffer], { type: mimeType });
		}

		super.end();
	}
}

export default MediaBunnyRecorder;
