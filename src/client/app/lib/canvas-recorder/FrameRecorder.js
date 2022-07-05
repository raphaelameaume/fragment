import { createBlobFromDataURL } from "../../utils/file.utils";
import { map } from "../../utils/math.utils";
import CanvasRecorder from "./CanvasRecorder";
import { exportCanvas } from "./utils";

class FrameRecorder extends CanvasRecorder {

	constructor(canvas, options) {
		super(canvas, options);

		const { imageEncoding = 'png' } = options;

		this.imageEncoding = imageEncoding;

		this.imageQuality = map(this.quality, 1, 100, 0, 1);
	}

	start() {
		this.frames = [];

		super.start();
	}

	tick() {
		let { dataURL } = exportCanvas(this.canvas, {
			encoding: `image/${this.imageEncoding}`,
			encodingQuality: this.imageQuality,
		});

		this.frames[this.frameCount] = dataURL;
	}

	async end() {
		this.result = await Promise.all(this.frames.map((dataURL) => createBlobFromDataURL(dataURL)));

		super.end();
	}
}

export default FrameRecorder;
