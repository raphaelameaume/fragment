import Input from './Input';

const LOCAL_STORAGE_KEY = 'fragment.audio.requested';

class Audio extends Input {
	constructor() {
		super();

		this.requesting = false;
		this.requested = false;
		this.context = new AudioContext();
		this.analyser = this.context.createAnalyser();
		this.analyser.fftSize = 256;
		this.bufferLength = this.analyser.frequencyBinCount;
		this.data = new Uint8Array(this.bufferLength);

		this.master = this.context.createGain();
		this.master.connect(this.analyser);

		this.listeners = [];
		this.devices = [];

		const unlock = () => {
			if (
				this.context.state === 'suspended' ||
				this.context.state === 'interrupted'
			) {
				this.context.resume();

				document.removeEventListener('touchend', unlock, true);
				document.removeEventListener('mousedown', unlock, true);
				document.removeEventListener('click', unlock, true);
			}
		};

		document.addEventListener('touchend', unlock, true);
		document.addEventListener('mousedown', unlock, true);
		document.addEventListener('click', unlock, true);

		document.addEventListener('touchend', unlock, true);
		document.addEventListener('mousedown', unlock, true);
		document.addEventListener('click', unlock, true);

		// if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
		// 	this.request();
		// }
	}

	start(deviceId = 'default') {
		if (!this.requested) {
			this.request(deviceId);
			return;
		}

		this.running = true;

		let lastTime = performance.now();

		const run = (time) => {
			let dt = time - lastTime;
			lastTime = time;

			this.update(dt);
			this._raf = requestAnimationFrame(run);
		};

		this._raf = requestAnimationFrame(run);
	}

	stop() {
		if (this._raf) {
			cancelAnimationFrame(this._raf);
			this._raf = null;
		}

		this.running = false;

		if (this.stream) {
			this.stream.getTracks().forEach((track) => {
				track.stop();
			});
		}

		this.requested = false;
	}

	update() {
		this.analyser.getByteFrequencyData(this.data);

		this.listeners.forEach((listener) => {
			listener(this.data);
		});
	}

	onUpdate(listener) {
		this.listeners.push(listener);
	}

	async listDevices() {
		this.devices = await navigator.mediaDevices.enumerateDevices();
		this.devices = this.devices.filter(
			(device) =>
				device.kind === 'audioinput' && device.deviceId !== 'default',
		);

		return this.devices;
	}

	async request(deviceId = 'default') {
		try {
			if (!this.requesting && !this.requested) {
				localStorage.setItem(LOCAL_STORAGE_KEY, true);
				this.requesting = true;

				this.stream = await navigator.mediaDevices.getUserMedia({
					audio: {
						deviceId,
						echoCancellation: false,
						noiseSuppression: false,
					},
					video: false,
				});

				if (this.source) {
					this.source.disconnect(this.master);
				}

				this.source = this.context.createMediaStreamSource(this.stream);
				this.source.connect(this.master);

				this.enabled = true;
				this.requesting = false;
				this.requested = true;
				this.start(deviceId);
			}
		} catch (error) {
			console.error(
				`Audio :: cannot access microphone. Make sure to allow usage of the microphone.`,
			);
			console.error(error);
		}
	}
}

export default new Audio();
