import Range from './Range.js';

const defaultRanges = [0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125];

class Analyser {
	/**
	 * @param {Object} params
	 * @param {AudioContext} [params.context]
	 * @param {Number[]} [params.ranges]
	 * @param {Number} [params.smoothingTimeConstant = 0.3]
	 * @param {Number} [params.fftSize=512]
	 */
	constructor({
		context = new AudioContext(),
		ranges = defaultRanges,
		smoothingTimeConstant = 0.3,
		fftSize = 512,
	} = []) {
		this.context = context;

		this.ranges = [];

		this._analyser = this.context.createAnalyser();
		this._analyser.smoothingTimeConstant = smoothingTimeConstant;
		this._analyser.fftSize = fftSize;

		this.master = this.context.createGain();
		this.master.connect(this._analyser);

		const { frequencyBinCount } = this._analyser;

		this.frequencyBinCount = frequencyBinCount;
		this.freqByteData = new Uint8Array(frequencyBinCount);
		this.timeByteData = new Uint8Array(frequencyBinCount);

		this.setRanges(ranges);
	}

	/**
	 * Set the weight of the ranges used for the analysis
	 * @param {Number[]} [ranges]
	 */
	setRanges(ranges = defaultRanges) {
		if (this.ranges.length > 0) {
			for (let i = 0; i < this.ranges.length; i++) {
				this.ranges[i].dispose();
				this.ranges[i] = null;
			}

			this.ranges = [];
		}

		this.rangeCount = ranges.length;

		const sum = ranges.reduce((total, v) => {
			return total + v;
		}, 0);

		if (sum > 0 && sum !== 1) {
			console.error(`Tempo.Analyser :: sum of ranges is not equal to 1.`);
			return;
		}

		let start = 0;
		let end = this.frequencyBinCount;

		for (let i = 0; i < ranges.length; i++) {
			const step = ranges[i] * end;

			const range = new Range(start, start + step);

			this.ranges.push(range);

			start += step;
		}

		// global
		this.ranges.push(new Range(0, end));
	}

	/**
	 * Run the analysis of the current source
	 * @param {Number} deltaTime - Time elapsed since last call in milliseconds
	 */
	update(deltaTime) {
		this._analyser.getByteFrequencyData(this.freqByteData);

		for (let i = 0; i < this.ranges.length; i++) {
			this.ranges[i].update(deltaTime, this.freqByteData);
		}
	}

	/**
	 * Disconnect the current source of the analyser
	 */
	disconnect() {
		this.source.disconnect(this.master);
	}

	/**
	 * Connect a MediaStream to the analyser
	 * @param {MediaStream} stream
	 */
	connectMediaStream(stream) {
		if (this.source) {
			this.disconnect();
		}

		this.source = this.context.createMediaStreamSource(stream);
		this.source.connect(this.master);
	}

	/**
	 * Connect a HTMLMediaElement to the analyser
	 * @param {MediaElement} audio
	 */
	connectMediaElement(element) {
		if (this.source) {
			this.disconnect();
		}

		this.source = this.context.createMediaElementSource(element);
		this.source.connect(this.master);
	}

	getRange(index) {
		if (index >= this.rangeCount) {
			console.log(
				`Range ${index} is not available. RangeCount: ${this.rangeCount}`,
			);
			return;
		}

		return this.ranges[index];
	}

	getMaster() {
		return this.ranges[this.rangeCount];
	}

	dispose() {
		if (this.source) {
			this.disconnect();
			this.source = null;
		}

		for (let i = 0; i < this.ranges.length; i++) {
			this.ranges[i].dispose();
			this.ranges[i] = null;
		}

		this.ranges = null;

		this.master.disconnect(this._analyser);
		this.master = null;
		this._analyser = null;

		this.timeByteData = null;
		this.freqByteData = null;
		this.rangeCount = null;
		this.frequencyBinCount = null;
		this.context = null;
	}
}

export default Analyser;
