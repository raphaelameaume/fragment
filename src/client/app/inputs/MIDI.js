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
	}

	get inputs() {
		return this.access ? this.access.inputs : new Map();
	}

	get outputs() {
		return this.access ? this.access.outputs : new Map();
	}

	start() {
		this.access.onstatechange = (event) => this.onStateChange(event);

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

		let number = data1;
		let value = data2;

		console.log({ type, channel, note, velocity, rawVelocity, number, value });
	}

	onStateChange(e) {
		const event = e.port.state;

		if (this.listeners.has(event)) {
			const listeners = this.listeners.get(event);

			listeners.forEach(listener => listener(e));
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
