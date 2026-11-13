import { wildcard } from './shared';

let ID = 0;

/**
 * A generic callback used by a trigger.
 * @typedef {(...args: any[]) => void} TriggerCallback
 */

/**
 * @typedef {object} TriggerOptions
 * @property {string} [inputType]
 * @property {string} [eventName]
 * @property {TriggerCallback} [fn]
 * @property {string} [context]
 * @property {Record<string, any>} [params]
 * @property {boolean} [enabled]
 * @property {boolean} [collapsed]
 * @property {boolean} [hot]
 */

/**
 * @typedef {object} TriggerJSON
 * @property {string|undefined} inputType
 * @property {string|undefined} eventName
 * @property {boolean} enabled
 * @property {Record<string, any>|undefined} params
 * @property {string} context
 */

export class Trigger {
	/**
	 * @param {TriggerOptions} [opts]
	 */
	constructor({
		inputType,
		eventName,
		fn,
		context = wildcard,
		params = {},
		enabled = true,
		collapsed = false,
		hot = true,
	} = {}) {
		/** @type {number} */
		this.id = ID++;
		/** @type {string|undefined} */
		this.inputType = inputType;
		/** @type {string|undefined} */
		this.eventName = eventName;
		/** @type {Function|undefined} */
		this.fn = fn;
		/** @type {string} */
		this.context = context;
		/** @type {Record<string, any>|undefined} */
		this.params = params;
		/** @type {boolean} */
		this.enabled = enabled;
		/** @type {boolean} */
		this.collapsed = collapsed;
		/** @type {boolean} */
		this.hot = hot;
	}

	/**
	 * Assign the callback that runs when the trigger fires.
	 * @param {TriggerCallback|undefined} fn
	 * @returns {void}
	 */
	assign(fn) {
		this.fn = fn;
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	/**
	 * Run the callback if the trigger is enabled.
	 * @param {...any} args
	 * @returns {void}
	 */
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

	/**
	 * @returns {TriggerJSON}
	 */
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
