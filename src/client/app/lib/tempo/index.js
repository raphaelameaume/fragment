import Analyser from './Analyser.js';

class Tempo {
	constructor({
		context = new AudioContext(),
		ranges,
		autoUpdate = true,
	} = {}) {
		this.context = context;
		this.autoUpdate = autoUpdate;
		this.analyser = new Analyser({
			context: this.context,
			ranges,
		});

		this.running = false;

		this.listeners = [];

		document.addEventListener('touchend', unlock, true);
		document.addEventListener('mousedown', unlock, true);
		document.addEventListener('click', unlock, true);

		document.addEventListener('touchend', unlock, true);
		document.addEventListener('mousedown', unlock, true);
		document.addEventListener('click', unlock, true);

		function unlock() {
			if (
				context.state === 'suspended' ||
				context.state === 'interrupted'
			) {
				context.resume();

				document.removeEventListener('touchend', unlock, true);
				document.removeEventListener('mousedown', unlock, true);
				document.removeEventListener('click', unlock, true);
			}

			return;

			// if (typeof context.resume === "function") {
			// 	return context.resume().then(startFakeBuffer);
			// }
		}
	}

	onUpdate(listener) {
		this.listeners.push(listener);

		return () => {
			this.listeners.splice(this.listeners.indexOf(listener), 1);
		};
	}

	get master() {
		return this.analyser.getMaster();
	}

	getRange(index) {
		return this.analyser.getRange(index);
	}

	getRanges() {
		const rangesWithoutMaster = [...this.analyser.ranges];
		rangesWithoutMaster.splice(this.analyser.ranges.length - 1, 1);

		return rangesWithoutMaster;
	}

	setRanges(ranges) {
		this.analyser.setRanges(ranges);
	}

	update(deltaTime) {
		this.analyser.update(deltaTime);

		for (let i = 0; i < this.listeners.length; i++) {
			this.listeners[i]();
		}
	}

	listen() {
		navigator.getUserMedia(
			{
				audio: true,
				video: false,
			},
			(stream) => {
				this.analyser.connectMediaStream(stream);

				if (this.autoUpdate) {
					this.start();
				}
			},
			(error) => {
				console.error(
					`Tempo :: cannot access microphone. Make sure to allow usage of the microphone.`,
				);
			},
		);
	}

	start() {
		this.running = true;

		let lastTime = performance.now();

		const run = (time = 0) => {
			let dt = time - lastTime;
			lastTime = time;

			this.update(dt);
			this._raf = requestAnimationFrame(run);
		};

		run();
	}

	stop() {
		if (this._raf) {
			cancelAnimationFrame(this._raf);
			this._raf = null;
		}

		this.running = false;
	}

	dispose() {
		if (this.running) {
			this.stop();
		}

		this.analyser.dispose();
		this.analyser = null;

		this.context.close();
		this.context = null;
		this.running = null;

		console.log('Tempo :: dispose', this);
	}
}

export default Tempo;
