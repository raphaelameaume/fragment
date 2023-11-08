import Input from './Input';

const commands = {
	0x8: 'noteoff',
	0x9: 'noteon',
	0xb: 'controlchange',
};

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const LOCAL_STORAGE_KEY = 'midi.requested';

class MIDI extends Input {
	constructor() {
		super();

		this.access = null;
		this.requesting = false;
		this.enabled = false;

		this.listeners = new Map();
		this.selectedInputID = null;
		this.selectedOutputID = null;

		if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
			this.request();
		}
	}

	get inputs() {
		return this.access ? this.access.inputs : new Map();
	}

	get outputs() {
		return this.access ? this.access.outputs : new Map();
	}

	start() {
		this.access.onstatechange = (event) => this.onStateChange(event);
		this.attachListeners();

		if (this.inputs.size === 1) {
			const [entry] = this.inputs.values();
			const { id } = entry;

			this.selectedInputID = id;
		}

		if (this.outputs.size === 1) {
			const [entry] = this.outputs.values();
			const { id } = entry;

			this.selectedOutputID = id;
		}
	}

	attachListeners() {
		this.inputs.forEach((entry) => {
			entry.onmidimessage = (event) => {
				this.onMessage(event);
			};
		});
	}

	addEventListener(eventName, fn) {
		if (!this.listeners.has(eventName)) {
			this.listeners.set(eventName, []);
		}

		this.listeners.set(eventName, [...this.listeners.get(eventName), fn]);
	}

	onMessage(event) {
		let command = event.data[0] >> 4;
		let type = commands[command];

		let channel = (event.data[0] & 0xf) + 1;
		let data1 = event.data[1];
		let data2 = event.data[2];

		let note = {
			number: data1,
			name: notes[data1 % 12],
		};

		let velocity = data2 / 127;
		let rawVelocity = data2;

		let controller = event.target;

		let data = {
			type,
			note,
			channel,
			velocity,
			rawVelocity,
			value: velocity,
			rawValue: rawVelocity,
			currentTarget: controller,
			target: controller,
			srcElement: controller,
		};

		this.emit('message', data);
		this.emit(type, data);
	}

	onStateChange(e) {
		const event = e.port.state;

		this.emit(event, e);
		this.attachListeners();
	}

	emit(eventName, data) {
		if (this.listeners.has(eventName)) {
			const listeners = this.listeners.get(eventName);

			listeners.forEach((listener) => listener(data));
		}
	}

	handleError(error) {
		console.error(error);
	}

	async request() {
		try {
			if (!this.requesting && !this.access) {
				localStorage.setItem(LOCAL_STORAGE_KEY, true);
				this.requesting = true;
				this.access = await navigator.requestMIDIAccess();
				this.enabled = true;
				this.requesting = false;
				this.start();
			}
		} catch (error) {
			this.handleError(error);
		}
	}
}

export default new MIDI();
