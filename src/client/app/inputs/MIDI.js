import Input from "./Input";

class MIDI extends Input {

	constructor() {
		super();

		this.access = null;
		this.inputs = null;
		this.outputs = null;
	}

	start() {
		console.log("Midi :: startt");
		this.inputs = this.access.inputs;
		this.outputs = this.access.outputs;

		this.access.onstatechange = (event) => this.onStateChange(event);

		this.inputs.forEach(entry => {
			entry.onmidimessage = (event) => {
				this.onMessage(event);
			};
		})
	}

	onMessage(event) {
		console.log(event);
	}

	onStateChange(e) {
		console.log(e.port.name, e.port.manufacturer, e.port.state);
	}

	handleError(error) {
		console.error(error);
	}

	async request() {
		try {
			this.access = await navigator.requestMIDIAccess()
			this.start();
		} catch(error) {
			this.handleError(error);
		}
	}
}

export default new MIDI();
