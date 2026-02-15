import { map } from '../../utils/math.utils';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import CanvasRecorder from './CanvasRecorder';

/**
 * @typedef {import('./CanvasRecorder').CanvasRecorderOptions} GIFRecorderOptions
 */

/**
 * Recorder that captures frames and encodes them as an animated GIF
 * @extends CanvasRecorder
 */
class GIFRecorder extends CanvasRecorder {
	/**
	 * Create a GIF recorder
	 * @param {HTMLCanvasElement} canvas - The canvas to record
	 * @param {GIFRecorderOptions} options - Recording options
	 */
	constructor(canvas, options) {
		super(canvas, options);

		/** @type {ReturnType<typeof GIFEncoder> | null} */
		this.encoder = null;

		/** @type {HTMLCanvasElement} */
		this.tmpCanvas = document.createElement('canvas');

		/** @type {CanvasRenderingContext2D | null} */
		this.tmpContext = this.tmpCanvas.getContext('2d');

		/** @type {number} */
		this.maxColors = 256;
	}

	/**
	 * Start GIF recording
	 * @returns {Promise<void>}
	 */
	async start() {
		this.encoder = GIFEncoder();

		this.tmpCanvas = document.createElement('canvas');
		this.tmpContext = this.tmpCanvas.getContext('2d');

		this.maxColors = Math.floor(map(this.quality, 20, 100, 32, 256));

		if (this.framerate > 50) {
			console.warn(`GIFRecorder :: recording was capped at 50fps.`);
			this.framerate = 50;
			this.deltaTime = 1000 / this.framerate;
			this.frameDuration = 1000 / this.framerate;
			this.frameTotal = isFinite(this.duration)
				? this.duration * this.framerate
				: Infinity;
		}

		await super.start();
	}

	/**
	 * Get RGBA pixel data from a bitmap
	 * @param {HTMLCanvasElement | ImageBitmap} bitmap - The bitmap to extract pixels from
	 * @param {number} [width=bitmap.width] - Target width
	 * @param {number} [height=bitmap.height] - Target height
	 * @returns {Uint8ClampedArray} RGBA pixel data
	 */
	getBitmapRGBA(bitmap, width = bitmap.width, height = bitmap.height) {
		this.tmpCanvas.width = width;
		this.tmpCanvas.height = height;

		if (this.tmpContext) {
			this.tmpContext.clearRect(0, 0, width, height);
			this.tmpContext.drawImage(bitmap, 0, 0, width, height);
			return this.tmpContext.getImageData(0, 0, width, height).data;
		}

		return new Uint8ClampedArray();
	}

	/**
	 * Capture and encode a single frame
	 * @param {import('./CanvasRecorder').TickData} _data - Frame data (unused)
	 * @returns {Promise<void>}
	 */
	async tick(_data) {
		const { width, height } = this.canvas;

		const pixels = this.getBitmapRGBA(this.canvas, width, height);
		const palette = quantize(pixels, this.maxColors);
		const index = applyPalette(pixels, palette);

		if (this.encoder) {
			this.encoder.writeFrame(index, width, height, {
				palette: palette,
				delay: this.frameDuration,
			});
		}
	}

	/**
	 * End recording and create GIF blob
	 * @returns {void}
	 */
	end() {
		if (this.encoder) {
			this.encoder.finish();
			this.result = new Blob([this.encoder.bytes()], {
				type: 'image/gif',
			});
		}

		super.end();
	}
}

export default GIFRecorder;
