import Input from "./Input";

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
		console.log("Midi :: start");

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
		console.log(event);
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
