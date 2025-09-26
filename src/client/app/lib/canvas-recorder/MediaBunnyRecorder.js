import loadMP4Module, { isWebCodecsSupported } from './mp4.js';
import CanvasRecorder from './CanvasRecorder.js';
import {
	Output,
	Mp4OutputFormat,
	MkvOutputFormat,
	MovOutputFormat,
	WebMInputFormat,
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
	 *
	 * @param {HTMLCanvasElement} canvas
	 * @param {object} options
	 * @param {codec} options.string
	 */
	constructor(canvas, { codec, ...options }) {
		super(canvas, options);

		/** @type {string} */
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

	async load() {
		await this.output.start();
	}

	async tick({ frameCount, time }) {
		const timestamp = frameCount / this.framerate;

		this.videoSource.add(timestamp, this.frameDuration / 1000);
	}

	async end() {
		await this.output.finalize();

		const { mimeType } = this.output.format;
		const { buffer } = this.output.target;

		this.result = new Blob([buffer], { type: mimeType });

		super.end();
	}
}

export default MediaBunnyRecorder;
