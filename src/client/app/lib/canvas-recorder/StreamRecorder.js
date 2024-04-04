import { createBlobFromDataURL } from '../../utils/file.utils';
import { map } from '../../utils/math.utils';
import CanvasRecorder from './CanvasRecorder';
import { exportCanvas } from './utils';
import Audio from '../../inputs/Audio.js';

class StreamRecorder extends CanvasRecorder {
	constructor(canvas, options) {
		super(canvas, options);
	}

	start() {
		this.chunks = [];
		this.canvasStream = this.canvas.captureStream();
		this.stream = new MediaStream([
			...this.canvasStream.getVideoTracks(),
			...(Audio.stream ? Audio.stream.getAudioTracks() : []),
		]);

		this.recorder = new MediaRecorder(this.stream);

		this.recorder.ondataavailable = (e) => {
			this.chunks.push(e.data);
		};

		const { promise, resolve } = Promise.withResolvers();

		this.createBlobFromStream = () => promise;

		this.recorder.onstop = (e) => {
			const blob = new Blob(this.chunks, {
				type: 'video/webm; codecs=opus',
			});

			resolve(blob);
		};

		this.recorder.start();

		super.start();
	}

	tick() {}

	async end() {
		this.recorder.stop();

		this.result = await this.createBlobFromStream();

		super.end();

		this.canvasStream.getTracks().forEach((track) => track.stop());
	}
}

export default StreamRecorder;
