import { getContext, wildcard } from '../triggers/shared';
import Trigger from '../triggers/Trigger';

class Input {
	constructor({ type } = {}) {
		/** @type {string} */
		this.type = type;
		/** @type {boolean} */
		this.enabled = true;
		/** @type {Trigger[]} */
		this.triggers = [];
	}

	/**
	 *
	 * @param {Function} fn
	 * @param {*} param1
	 * @returns
	 */
	createTrigger(
		fn,
		{ eventName, context = getContext(), hot, enabled, ...params },
	) {
		const trigger = new Trigger({
			inputType: this.type,
			eventName,
			context,
			hot,
			fn,
			enabled,
			params,
		});

		this.triggers.push(trigger);

		return trigger;
	}

	/**
	 *
	 * @param {Trigger} trigger
	 */
	add(trigger) {
		this.triggers.push(trigger);
	}

	remove(trigger) {
		const index = this.triggers.findIndex((t) => t === trigger);

		if (index >= 0) {
			this.triggers.splice(index, 1);
		}

		trigger.dispose();
	}

	runTriggers(event, { context, eventName, params = {} }) {
		if (!this.enabled) return;

		const triggers = this.triggers.filter(
			(trigger) =>
				trigger.eventName == eventName &&
				(context
					? trigger.context === context ||
						trigger.context === wildcard
					: true) &&
				(params.key && trigger.params.key?.length > 0
					? trigger.params.key.includes(params.key)
					: true),
		);

		triggers.forEach((trigger) => {
			trigger.run(event);
		});
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}
}

export default Input;
