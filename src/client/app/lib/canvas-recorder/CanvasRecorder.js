/**
 * @callback CanvasRecorderStartCallback
 * @returns {void}
 */

/**
 * @callback CanvasRecorderTickCallback
 * @param {TickData} data - Tick data
 * @returns {void}
 */

/**
 * @callback CanvasRecorderCompleteCallback
 * @param {Blob | Blob[] | null} result
 * @returns {void}
 */

/**
 * @typedef {Object} TickData
 * @property {number} time - Current time in milliseconds
 * @property {number} deltaTime - Time since last frame in milliseconds
 * @property {number} frameCount - Current frame count
 */

/**
 * @typedef {Object} CanvasRecorderOptions
 * @property {number} [duration=Infinity] - Recording duration in seconds
 * @property {number} [framerate=25] - Frames per second
 * @property {number} [quality=100] - Recording quality (1-100)
 * @property {string} format - Output format
 * @property {CanvasRecorderStartCallback} [onStart] - Callback when recording starts
 * @property {CanvasRecorderTickCallback} [onTick] - Callback on each frame
 * @property {CanvasRecorderCompleteCallback} [onComplete] - Callback when recording completes
 */

/** @type {CanvasRecorderStartCallback} */
let noop = () => {};

class CanvasRecorder {
	/**
	 * Create a canvas recorder
	 * @param {HTMLCanvasElement} canvas - The canvas to record
	 * @param {CanvasRecorderOptions} options - Recording options
	 */
	constructor(
		canvas,
		{
			duration = Infinity,
			framerate = 25,
			quality = 100,
			format,
			onStart = noop,
			onTick = noop,
			onComplete = noop,
		},
	) {
		/** @type {HTMLCanvasElement} */
		this.canvas = canvas;
		/** @type {number} */
		this.framerate = framerate;
		/** @type {number} */
		this.duration = duration;
		/** @type {number} */
		this.quality = quality;
		/** @type {string} */
		this.format = format;
		/** @type {CanvasRecorderStartCallback} */
		this.onStart = onStart;
		/** @type {CanvasRecorderTickCallback} */
		this.onTick = onTick;
		/** @type {Function} */
		this.onComplete = onComplete;
		/** @type {number} */
		this.time = 0;

		/** @type {number} */
		this.deltaTime = 1000 / this.framerate;

		/** @type {number} */
		this.frameDuration = 1000 / this.framerate;

		/** @type {number} */
		this.frameTotal = isFinite(this.duration)
			? this.duration * this.framerate
			: Infinity;

		/** @type {boolean} */
		this.started = false;

		/** @type {boolean} */
		this.stopped = false;

		/** @type {number} */
		this.startTime = 0;

		/** @type {number} */
		this.frameCount = 0;

		/** @type {Blob | Blob[] | null} */
		this.result = null;
	}

	/**
	 * Load resources before recording (override in subclass)
	 * @returns {Promise<void>}
	 */
	async load() {}

	/**
	 * Start the recording
	 * @returns {Promise<void>}
	 */
	async start() {
		this.startTime = performance.now();
		this.onStart();

		await this.load();

		if (this.stopped) {
			console.log(`CanvasRecorder : stopped while loading`);
			return;
		}

		if (isFinite(this.frameTotal)) {
			console.log(
				`CanvasRecorder - start rendering ${this.frameTotal} frames at ${this.framerate}fps for ${this.duration}s.`,
			);
		} else {
			console.log(
				`CanvasRecorder - start rendering at ${this.framerate}fps.`,
			);
		}

		this.frameCount = 0;
		this.started = true;
		this.stopped = false;

		this._tick();
	}

	/**
	 * Internal tick handler
	 * @private
	 * @returns {Promise<void>}
	 */
	async _tick() {
		console.log(`CanvasRecorder - render frame ${this.frameCount + 1}`);
		this.onTick({
			time: this.time,
			deltaTime: this.deltaTime,
			frameCount: this.frameCount,
		});

		await this.tick({
			time: this.time,
			deltaTime: this.deltaTime,
			frameCount: this.frameCount,
		});

		if (
			this.started &&
			!this.stopped &&
			(!isFinite(this.frameTotal) ||
				(isFinite(this.frameTotal) &&
					this.frameCount < this.frameTotal - 1))
		) {
			this.time += this.deltaTime;
			this.frameCount++;
			requestAnimationFrame(() => {
				this._tick();
			});
		} else {
			console.log(
				`CanvasRecorder - compiling ${this.frameCount + 1} frames...`,
			);
			this.end();
		}
	}

	/**
	 * Process a single frame (override in subclass)
	 * @param {TickData} _data - Frame data
	 * @returns {Promise<void>}
	 */
	async tick(_data) {}

	/**
	 * End the recording and compile result
	 * @returns {void}
	 */
	end() {
		console.log(
			`CanvasRecorder - compiled ${this.frameCount + 1} frames in ${(performance.now() - this.startTime) / 1000}s`,
		);
		this.onComplete(this.result);
	}

	/**
	 * Stop the recording
	 * @returns {void}
	 */
	stop() {
		this.stopped = true;
	}
}

export default CanvasRecorder;
