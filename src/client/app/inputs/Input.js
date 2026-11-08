export class Input {
	/**
	 * @param {object} params
	 * @param {string} params.name
	 */
	constructor({ name }) {
		this.name = name;
		this.enabled = true;
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}
}
