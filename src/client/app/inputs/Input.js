import { wildcard } from '../triggers/shared';
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

	createTrigger(
		fn,
		{
			eventName,
			collection,
			context = getContext(),
			hot,
			enabled,
			...params
		},
	) {
		const trigger = new Trigger({
			inputType: this.type,
			eventName,
			context,
			hot,
			fn,
			enabled,
			params,
			destroy: () => {
				const index = collection.findIndex((t) => t === trigger);

				collection.splice(index, 1);
			},
		});

		return trigger;
	}

	add(trigger) {
		this.triggers.push(trigger);
	}

	remove(trigger) {
		const index = this.triggers.findIndex((t) => t === trigger);

		if (index >= 0) {
			this.triggers.splice(index, 1);
		}
	}

	runTriggers(event, { context, eventName, params }) {
		if (!this.enabled) return;

		const triggers = this.triggers.filter(
			(trigger) =>
				trigger.eventName == eventName &&
				(context
					? trigger.context === context ||
						trigger.context === wildcard
					: true) &&
				(params ? trigger.params.key.includes(params.key) : true),
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
