import { createBlobFromDataURL } from '../../utils/file.utils';
import { map } from '../../utils/math.utils';
import { CanvasRecorder } from './CanvasRecorder';
import { exportCanvas } from './utils';

/**
 * @typedef {import('./CanvasRecorder').CanvasRecorderOptions & {
 *   imageEncoding?: string
 * }} FrameRecorderOptions
 * `imageEncoding` - Image encoding format (png, jpeg, webp). Defaults to 'png'.
 */

/**
 * Recorder that captures individual frames as images
 * @extends CanvasRecorder
 */
export class FrameRecorder extends CanvasRecorder {
	/**
	 * Create a frame recorder
	 * @param {HTMLCanvasElement} canvas - The canvas to record
	 * @param {FrameRecorderOptions} options - Recording options
	 */
	constructor(canvas, options) {
		super(canvas, options);

		const { imageEncoding = 'png' } = options;

		/** @type {string} */
		this.imageEncoding = imageEncoding;

		/** @type {number} */
		this.imageQuality = map(this.quality, 1, 100, 0, 1);

		/** @type {string[]} */
		this.frames = [];

		/** @type {Blob[]} */
		this.result = [];
	}

	/**
	 * Start recording frames
	 * @returns {Promise<void>}
	 */
	async start() {
		this.frames = [];

		await super.start();
	}

	/**
	 * Capture a single frame
	 * @param {import('./CanvasRecorder').TickData} _data - Frame data (unused)
	 * @returns {Promise<void>}
	 */
	async tick(_data) {
		let { dataURL } = exportCanvas(this.canvas, {
			encoding: `image/${this.imageEncoding}`,
			encodingQuality: this.imageQuality,
		});

		this.frames[this.frameCount] = dataURL;
	}

	/**
	 * End recording and convert frames to blobs
	 * @returns {Promise<void>}
	 */
	async end() {
		this.result = await Promise.all(
			this.frames.map((dataURL) => createBlobFromDataURL(dataURL)),
		);

		await super.end();
	}
}
