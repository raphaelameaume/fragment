import { wildcard } from './shared';

let ID = 0;

class Trigger {
	/**
	 *
	 * @param {object} params
	 * @param {string} params.inputType
	 * @param {string} params.eventName
	 * @param {Function|undefined} params.fn
	 * @param {string} params.context
	 * @param {Object|undefined} params.params
	 * @param {boolean} params.enabled
	 * @param {object} params
	 */
	constructor({
		inputType,
		eventName,
		fn,
		context = wildcard,
		params,
		enabled = true,
		hot = true,
	} = {}) {
		this.id = ID++;
		/** @type {string} */
		this.inputType = inputType;
		/** @type {string} */
		this.eventName = eventName;
		/** @type {Function|undefined} */
		this.fn = fn;
		/** @type {string} */
		this.context = context;
		/** @type {object} */
		this.params = params;
		/** @type {boolean} */
		this.enabled = enabled;
		/** @type {boolean} */
		this.hot = hot;
	}

	assign(fn) {
		this.fn = fn;
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	run(...args) {
		if (this.enabled) {
			this.fn?.(...args);
		}
	}

	dispose() {
		// remove reference
		this.fn = undefined;
		this.params = undefined;
	}

	toJSON() {
		return {
			inputType: this.inputType,
			eventName: this.eventName,
			enabled: this.enabled,
			params: this.params,
			context: this.context,
		};
	}
}

export default Trigger;
