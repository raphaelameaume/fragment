import WebMWriter from "webm-writer";
import { map } from "../../utils/math.utils";
import CanvasRecorder from "./CanvasRecorder";

class WebMRecorder extends CanvasRecorder {

	start() {
		const quality = map(this.quality, 1, 100, 0, 0.99999);

		this.writer = new WebMWriter({
			quality,
			frameRate: this.framerate,
		});

		super.start();
	}

	tick() {
		this.writer.addFrame(this.canvas);
	}

	async end() {
		this.result = await this.writer.complete();
		this.writer = null;

		super.end();
	}
}

export default WebMRecorder;
