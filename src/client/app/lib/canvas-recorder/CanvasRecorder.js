let noop = () => {};

class CanvasRecorder {

	constructor(canvas, {
		duration = Infinity,
		framerate = 25,
		quality = 100,
		onStart = noop,
		onTick = noop,
		onComplete = noop,
	}) {
		this.canvas = canvas;
		this.framerate = framerate;
		this.duration = duration;
		this.quality = quality;
		this.onStart = onStart;
		this.onTick = onTick;
		this.onComplete = onComplete;

		this.time = 0;
		this.deltaTime = (1000 / this.framerate);

		this.frameDuration = (1000 / this.framerate);
		this.frameTotal = isFinite(duration) ? this.duration * this.framerate : Infinity;
		this.started = false;
		this.stopped = false;
	}

	async load() {}

	async start() {
		this.onStart();

		await this.load();

		if (this.stopped) {
			console.log(`CanvasRecorder : stopped while loading`);
			return;
		}

		console.log(`CanvasRecorder - start rendering ${this.frameTotal} frames`, this.framerate, this.duration);

		this.frameCount = 0;
		this.started = true;
		this.stopped = false;

		this._tick();
	}

	async _tick() {
		console.log(`CanvasRecorder - render frame ${this.frameCount}`);
		this.onTick({
			time: this.time,
			deltaTime: this.deltaTime,
		});

		await this.tick({
			time: this.time,
			deltaTime: this.deltaTime,
			frameCount: this.frameCount,
		});

		if (this.started && !this.stopped && (!isFinite(this.frameTotal) || (isFinite(this.frameTotal) && this.frameCount < this.frameTotal))) {
			this.time += this.deltaTime;
        	this.frameCount++;
            requestAnimationFrame(() => {
				this._tick()
			});
        } else {
			console.log(`CanvasRecorder - compiling ${this.frameCount} frames...`);
            this.end();
        }
	}

	tick() {}

	end() {
		console.log(`CanvasRecorder - compiled ${this.frameCount} frames`);
		this.onComplete(this.result);
	}

	stop() {
		this.stopped = true;
	}
}

export default CanvasRecorder;
