import loadMP4Module, { isWebCodecsSupported } from "https://unpkg.com/mp4-wasm@1.0.6";
import CanvasRecorder from "./CanvasRecorder";

let MP4;

class MP4Recorder extends CanvasRecorder {

	static loaded = false;
	static isSupported = true;
	
	constructor(canvas, options) {
		super(canvas, options);
	}

	async load() {
		if (!MP4Recorder.loaded) {
			MP4 = await loadMP4Module();

			MP4Recorder.loaded = true;
		}

		this.encoder = MP4.createWebCodecsEncoder({
			width: this.canvas.width,
			height: this.canvas.height,
			fps: this.framerate,
		});
	}

	async tick() {
		const bitmap = await window.createImageBitmap(this.canvas);

      	// Add bitmap to encoder
      	await this.encoder.addFrame(bitmap);
	}

	async end() {
		const buffer = await this.encoder.end(); 

		this.result = new Blob([buffer], { type: "video/mp4" })

		super.end();
	}
	
}

export default MP4Recorder;
