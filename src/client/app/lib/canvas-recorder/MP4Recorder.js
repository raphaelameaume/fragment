import CanvasRecorder from "./Recorder";

let ffmpeg;

class MP4Recorder extends CanvasRecorder {
	
	constructor(canvas, options) {
		super(canvas, options);

		if (!ffmpeg) {
            const { createFFmpeg } = FFmpeg;

            ffmpeg = createFFmpeg({ log: false });
        }
	}

	load() {
		if (!ffmpeg.isLoaded()) {
            console.log(`[fragment] MP4Recorder - loading ffmpeg...`);
            return ffmpeg.load().then(() => {
                console.log(`[fragment] MP4 Recorder - loaded ffpmpeg`);
            })
        }
	}

	tick() {
		return new Promise((resolve, reject) => {
			this.canvas.toBlob(async (blob) => {
				const fn = `frame_${this.frameCount.toString().padStart(4, '0')}.png`;
				ffmpeg.FS('writeFile', fn, new Uint8Array(await blob.arrayBuffer()));
				resolve();
			});
		});
	}

	async end() {
		await ffmpeg.run(...(`-r ${this.framerate} -i frame_%04d.png -vcodec libx264 -crf 15 -pix_fmt yuv420p output.mp4`.split(' ')));
        const data = ffmpeg.FS('readFile', `output.mp4`);

		this.result = new Blob([data.buffer], { type: `video/mp4` });

		super.end();
	}
	
}

export default MP4Recorder;
