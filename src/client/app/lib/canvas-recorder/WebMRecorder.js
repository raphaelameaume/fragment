import WebMWriter from "webm-writer";
import CanvasRecorder from "./Recorder";

class WebMRecorder extends CanvasRecorder {

	start() {
		this.writer = new WebMWriter({
			quality: 0.95,
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
