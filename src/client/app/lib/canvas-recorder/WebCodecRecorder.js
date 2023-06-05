import CanvasRecorder from './CanvasRecorder';
import { AVC } from 'media-codecs';
import * as MP4Muxer from 'mp4-muxer';

class WebCodecRecorder extends CanvasRecorder {
	static loaded = false;
	static isSupported =
		typeof window !== 'undefined' &&
		typeof window.VideoEncoder === 'function';

	constructor(canvas, options) {
		super(canvas, options);

		const codec = AVC.getCodec({ profile: 'High', level: '5.2' });
		this.codec = codec;

		const CCCC = codec.split('.')[0];

		this.muxer = new MP4Muxer.Muxer({
			target: new MP4Muxer.ArrayBufferTarget(),
			type: 'webm',
			video: {
				codec:
					CCCC.startsWith('hev') || CCCC.startsWith('hvc') // https://www.w3.org/TR/webcodecs-hevc-codec-registration/#fully-qualified-codec-strings
						? 'hevc'
						: 'avc',
				width: this.canvas.width,
				height: this.canvas.height,
			},

			firstTimestampBehavior: 'offset', // "strict" | "offset" | "permissive"
			// ...this.muxerOptions,
		});

		this.encoder = new VideoEncoder({
			output: (chunk, meta) => this.muxer.addVideoChunk(chunk, meta),
			error: (e) => console.error(e),
		});
	}

	async load() {
		const config = {
			width: this.canvas.width,
			height: this.canvas.height,
			frameRate: this.framerate,
			bitrate: 1e6,
			// alpha: "discard", // "keep"
			// bitrateMode: "variable", // "constant"
			latencyMode: 'quality', // "realtime" (faster encoding)
			// hardwareAcceleration: "no-preference", // "prefer-hardware" "prefer-software"
			...this.encoderOptions,
			codec: this.codec,
		};

		this.encoder.configure(config);
		if (!(await VideoEncoder.isConfigSupported(config)).supported) {
			throw new Error(
				`canvas-record: Unsupported VideoEncoder config\n ${JSON.stringify(
					config,
				)}`,
			);
		}
	}

	async tick() {
		const frame = new VideoFrame(this.canvas, {
			timestamp: this.time * 1_000, // in µs
		});

		this.encoder.encode(frame, { keyFrame: this.frameCount });
		frame.close();

		const flushFrequency = 10;

		if (flushFrequency && (this.frameCount + 1) % flushFrequency === 0) {
			await this.encoder.flush();
		}
	}

	async end() {
		await this.encoder.flush();

		this.muxer.finalize();

		const buffer = this.muxer.target?.buffer;

		this.result = new Blob([buffer], { type: 'video/mp4' });

		super.end();
	}
}

export default WebCodecRecorder;
