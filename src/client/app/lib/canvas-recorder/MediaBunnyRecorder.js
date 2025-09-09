import loadMP4Module, { isWebCodecsSupported } from './mp4.js';
import CanvasRecorder from './CanvasRecorder.js';
import {
	Output,
	Mp4OutputFormat,
	BufferTarget,
	CanvasSource,
	Quality,
	QUALITY_VERY_LOW,
	QUALITY_LOW,
	QUALITY_MEDIUM,
	QUALITY_HIGH,
	QUALITY_VERY_HIGH,
} from 'mediabunny';
import { map } from '@fragment/utils/math.utils.js';

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

		/** @type {Output} */
		this.output = new Output({
			format: new Mp4OutputFormat(),
			target: new BufferTarget(),
		});

		const { BITRATES } = MediaBunnyRecorder;

		const bitrate =
			BITRATES[
				Math.floor(map(this.quality, 1, 100, 0, BITRATES.length - 1))
			];

		console.log(
			this.quality,
			Math.floor(map(this.quality, 1, 100, 0, BITRATES.length - 1)),
			bitrate,
			BITRATES,
		);

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
		const { buffer } = this.output.target;

		const mimetypes = new Map();
		mimetypes.set('mp4', 'video/mp4');
		mimetypes.set('mov', 'video/quicktime');
		mimetypes.set('mkv', 'video/x-matroska');
		mimetypes.set('webm', 'video/webm');

		const type = mimetypes.get(this.format);

		this.result = new Blob([buffer], { type });

		super.end();
	}
}

export default MediaBunnyRecorder;
