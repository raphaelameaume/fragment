class Range {
	constructor(start, end) {
		this.start = start;
		this.end = end;

		this.BEAT_HOLD_TIME = 300; // between 0 and 1000
		this.BEAT_DECAY_RATE = 0.992; // between  0 and 1
		this.BEAT_MIN = 0.1; // between 0 and 1

		this._volume = 0;
		this.beatCutOff = 0;
		this.beatTime = 0;

		this.listeners = [];
	}

	get volume() {
		return this._volume;
	}

	get decay() {
		return (this.BEAT_DECAY_RATE - 0.95) / 0.0499;
	}

	set decay(value) {
		this.BEAT_DECAY_RATE = 0.95 + value * 0.0499;
	}

	get min() {
		return this.BEAT_MIN;
	}

	set min(value) {
		this.BEAT_MIN = value;
	}

	get hold() {
		return this.BEAT_HOLD_TIME / 1000;
	}

	set hold(value) {
		this.BEAT_HOLD_TIME = value * 1000;
	}

	onBeat(listener) {
		this.listeners.push(listener);

		return () => {
			const index = this.listeners.indexOf(listener);

			this.listeners.splice(index, 1);
		};
	}

	update(deltaTime, freqByteData) {
		this._volume = 0;

		for (let i = this.start; i < this.end; i++) {
			this._volume += freqByteData[i];
		}

		this._volume /= (this.end - this.start) * 256;

		// detect beat
		if (
			this.beatTime >= this.BEAT_HOLD_TIME &&
			this._volume > this.beatCutOff &&
			this._volume > this.BEAT_MIN
		) {
			for (let i = 0; i < this.listeners.length; i++) {
				this.listeners[i]();
			}

			this.beatCutOff = this._volume * 1.15;
			this.beatTime = 0;
		} else {
			if (this.beatTime <= this.BEAT_HOLD_TIME) {
				this.beatTime += deltaTime * 1000;
			} else {
				this.beatCutOff *= this.BEAT_DECAY_RATE;
				this.beatCutOff = Math.max(this.beatCutOff, this.BEAT_MIN);
			}
		}
	}

	dispose() {
		this.start = null;
		this.end = null;

		this.BEAT_HOLD_TIME = null;
		this.BEAT_DECAY_RATE = null;
		this.BEAT_MIN = null;

		this._volume = null;
		this.beatCutOff = null;
		this.beatTime = null;
	}
}

export default Range;
