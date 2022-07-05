import { map } from "../../utils/math.utils";
import { loadScript } from "../loader/loadScript";
import CanvasRecorder from "./CanvasRecorder";

class GIFRecorder extends CanvasRecorder {

	static loaded = false;

	async load() {
		if (!GIFRecorder.loaded) {
			await loadScript('/js/gif.worker.js');
			await loadScript('/js/gif.js');

			GIFRecorder.loaded = true;
		}

		const quality = map(this.quality, 1, 100, 10, 0);

		this.writer = new GIF({
			workerScript: '/js/gif.worker.js',
			workers: 4,
			quality,
			width: this.canvas.width,
			height: this.canvas.height,
		});
	}

	tick() {
		this.writer.addFrame(this.canvas, { copy: true, delay: this.frameDuration });
	}

	end() {
		return new Promise((resolve, reject) => {
			this.writer.on('finished', (result) => {
				this.result = result;
				this.writer = null;

				super.end();

				resolve();
			});

			this.writer.on('error', (err) => {
				reject(err);
			});

			this.writer.render();
		});
	}
}

export default GIFRecorder;
