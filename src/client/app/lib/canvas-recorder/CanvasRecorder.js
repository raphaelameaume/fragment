import { sleepUntil, waitForNextFrame } from './utils';

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
 * @property {number} time - Current (virtual) time in milliseconds
 * @property {number} deltaTime - Time since last frame in milliseconds
 * @property {number} frameCount - Current frame count
 */

/**
 * @typedef {Object} CanvasRecorderOptions
 * @property {number} [duration=Infinity] - Recording duration in seconds
 * @property {number} [framerate=25] - Frames per second
 * @property {number} [quality=100] - Recording quality (1-100)
 * @property {string} format - Output format
 * @property {boolean} [realtime=true] - If true, waits the real frame duration between frames. If false, renders as fast as possible.
 * @property {CanvasRecorderStartCallback} [onStart] - Callback when recording starts
 * @property {CanvasRecorderTickCallback} [onTick] - Callback on each frame
 * @property {CanvasRecorderCompleteCallback} [onComplete] - Callback when recording completes
 */

/** @type {CanvasRecorderStartCallback} */
let noop = () => {};

export class CanvasRecorder {
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
			realtime = true,
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
		/** @type {boolean} */
		this.realtime = realtime;
		/** @type {CanvasRecorderStartCallback} */
		this.onStart = onStart;
		/** @type {CanvasRecorderTickCallback} */
		this.onTick = onTick;
		/** @type {Function} */
		this.onComplete = onComplete;

		/** @type {number} Virtual time in ms (always frameCount * deltaTime) */
		this.time = 0;

		/** @type {number} */
		this.deltaTime = 0;

		/** @type {number} */
		this.frameDuration = 0;

		/** @type {number} */
		this.frameTotal = Infinity;

		/** @type {boolean} */
		this.started = false;

		/** @type {boolean} */
		this.stopped = false;

		/** @type {number} */
		this.startTime = 0;

		/** @type {number} Wall-clock time (ms) at which frame 0 is due */
		this.recordStart = 0;

		/** @type {number} */
		this.frameCount = 0;

		/** @type {Blob | Blob[] | null} */
		this.result = null;

		this._updateTiming();
	}

	/**
	 * Recompute all values derived from framerate / duration.
	 * Call again if framerate or duration is changed by a subclass.
	 * @protected
	 * @returns {void}
	 */
	_updateTiming() {
		this.deltaTime = 1000 / this.framerate;
		this.frameDuration = 1000 / this.framerate;
		this.frameTotal = isFinite(this.duration)
			? this.duration * this.framerate
			: Infinity;
	}

	/**
	 * Start the recording.
	 * Subclasses can override this to do async setup, then call `super.start()`.
	 * @returns {Promise<void>}
	 */
	async start() {
		this.startTime = performance.now();

		// stop() may have been called during a subclass' async setup
		if (this.stopped) {
			console.log(`CanvasRecorder - stopped before start`);
			return;
		}

		this.onStart();

		if (isFinite(this.frameTotal)) {
			console.log(
				`CanvasRecorder - start rendering ${this.frameTotal} frames at ${this.framerate}fps for ${this.duration}s (${this.realtime ? 'realtime' : 'non-realtime'}).`,
			);
		} else {
			console.log(
				`CanvasRecorder - start rendering at ${this.framerate}fps (${this.realtime ? 'realtime' : 'non-realtime'}).`,
			);
		}

		this.frameCount = 0;
		this.time = 0;
		this.started = true;

		// Wall-clock origin for frame 0 (after setup, so setup time doesn't count)
		this.recordStart = performance.now();

		await this._run();
	}

	/**
	 * Main loop
	 * @private
	 * @returns {Promise<void>}
	 */
	async _run() {
		while (true) {
			if (this.realtime) {
				// Frame N is due at recordStart + N * frameDuration.
				// Using an absolute target avoids accumulating drift.
				await sleepUntil(
					this.recordStart + this.frameCount * this.frameDuration,
				);
			} else {
				// Let the browser breathe (events, paint, GC)
				await waitForNextFrame();
			}

			if (this.stopped) break;

			/** @type {TickData} */
			const data = {
				time: this.time,
				deltaTime: this.deltaTime,
				frameCount: this.frameCount,
			};

			this.onTick(data);
			await this.tick(data);

			const done =
				isFinite(this.frameTotal) &&
				this.frameCount >= this.frameTotal - 1;

			if (done || this.stopped) break;

			this.time += this.deltaTime;
			this.frameCount++;
		}

		console.log(
			`CanvasRecorder - compiling ${this.frameCount + 1} frames...`,
		);

		await this.end();
	}

	/**
	 * Process a single frame (override in subclass)
	 * @param {TickData} _data - Frame data
	 * @returns {Promise<void>}
	 */
	async tick(_data) {}

	/**
	 * End the recording and compile result
	 * @returns {void | Promise<void>}
	 */
	end() {
		console.log(
			`CanvasRecorder - compiled ${this.frameCount + 1} frames in ${((performance.now() - this.startTime) / 1000).toFixed(2)}s`,
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
