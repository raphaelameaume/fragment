import Input from "./Input";

const commands = {
	0x8: "noteoff",
	0x9: "noteon",
	0xB: "controlchange",
};

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

class MIDI extends Input {

	constructor() {
		super();

		this.access = null;

		this.listeners = new Map();
		this.selectedInputID = null;
		this.selectedOutputID = null;
	}

	get inputs() {
		return this.access ? this.access.inputs : new Map();
	}

	get outputs() {
		return this.access ? this.access.outputs : new Map();
	}

	start() {
		console.log("start");
		this.access.onstatechange = (event) => this.onStateChange(event);
		this.attachListeners();
	}

	attachListeners() {
		this.inputs.forEach(entry => {
			entry.onmidimessage = (event) => {
				this.onMessage(event);
			};
		})
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
    	let data1 = event.data[1]
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

		console.log(event, e);

		this.emit(event, e);
		this.attachListeners();
	}

	emit(eventName, data) {
		if (this.listeners.has(eventName)) {
			const listeners = this.listeners.get(eventName);

			listeners.forEach(listener => listener(data));
		}
	}

	handleError(error) {
		console.error(error);
	}

	async request() {
		try {
			if (!this.access) {
				this.access = await navigator.requestMIDIAccess()
				this.start();
			}
		} catch(error) {
			this.handleError(error);
		}
	}
}

export default new MIDI();
