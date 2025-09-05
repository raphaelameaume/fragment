import loadMP4Module, { isWebCodecsSupported } from './mp4.js';
import CanvasRecorder from './CanvasRecorder';
import {
	Output,
	Mp4OutputFormat,
	BufferTarget,
	CanvasSource,
	Quality,
	QUALITY_VERY_LOW,
	QUALITY_VERY_HIGH,
} from 'mediabunny';

class WebMBunnyRecorder extends CanvasRecorder {
	static loaded = false;
	static isSupported = true;

	constructor(canvas, options) {
		super(canvas, options);

		this.output = new Output({
			format: new Mp4OutputFormat(),
			target: new BufferTarget(),
		});

		this.videoSource = new CanvasSource(this.canvas, {
			codec: 'vp9',
			bitrate: QUALITY_VERY_LOW, // 1 Mbps,
		});

		this.output.addVideoTrack(this.videoSource, {
			frameRate: this.framerate,
		});
	}

	async load(np) {
		await this.output.start();
	}

	async tick({ frameCount, time }) {
		const timestamp = frameCount / this.framerate;

		this.videoSource.add(timestamp, this.frameDuration / 1000);
	}

	async end() {
		await this.output.finalize();
		const { buffer } = this.output.target;

		this.result = new Blob([buffer], { type: 'video/webm' });

		super.end();
	}
}

export default WebMBunnyRecorder;
