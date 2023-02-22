import { map } from '../../utils/math.utils';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import CanvasRecorder from './CanvasRecorder';

class GIFRecorder extends CanvasRecorder {
	start() {
		this.encoder = GIFEncoder();

		this.tmpCanvas = document.createElement('canvas');
		this.tmpContext = this.tmpCanvas.getContext('2d');

		this.maxColors = Math.floor(map(this.quality, 1, 100, 1, 256));

		super.start();
	}

	getBitmapRGBA(bitmap, width = bitmap.width, height = bitmap.height) {
		this.tmpCanvas.width = width;
		this.tmpCanvas.height = height;
		this.tmpContext.clearRect(0, 0, width, height);
		this.tmpContext.drawImage(bitmap, 0, 0, width, height);
		return this.tmpContext.getImageData(0, 0, width, height).data;
	}

	tick() {
		const { width, height } = this.canvas;

		const pixels = this.getBitmapRGBA(this.canvas, width, height);
		const palette = quantize(pixels, this.maxColors);
		const index = applyPalette(pixels, palette);

		this.encoder.writeFrame(index, width, height, {
			palette: palette,
			delay: this.frameDuration,
		});
	}

	end() {
		this.encoder.finish();

		this.result = new Blob([this.encoder.bytes()], { type: 'image/gif' });

		super.end();
	}
}

export default GIFRecorder;
