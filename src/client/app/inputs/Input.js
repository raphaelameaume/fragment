import { getContext, wildcard } from '../triggers/shared';
import Trigger from '../triggers/Trigger';

export class Input {
	/**
	 * @param {object} params
	 * @param {string} params.name
	 */
	constructor({ name }) {
		this.name = name;
		this.enabled = true;
		/** @type {Trigger[]} */
		this.triggers = [];
	}

	/**
	 *
	 * @param {import('../triggers/Trigger.js').TriggerCallback | undefined} fn
	 * @param {object} opts
	 * @param {string} opts.eventName
	 * @param {string} [opts.context]
	 * @param {boolean} [opts.hot]
	 * @param {boolean} [opts.enabled]
	 * @param {{ key?: string[] }} [opts.params]
	 * @returns {Trigger}
	 */
	createTrigger(
		fn,
		{ eventName, context = getContext(), hot, enabled, params = {} },
	) {
		const trigger = new Trigger({
			inputName: this.name,
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
	 * @param {Trigger} trigger
	 */
	add(trigger) {
		this.triggers.push(trigger);
	}

	/**
	 * @param {Trigger} trigger
	 */
	remove(trigger) {
		const index = this.triggers.findIndex((t) => t === trigger);

		if (index >= 0) {
			this.triggers.splice(index, 1);
		}

		trigger.dispose();
	}

	/**
	 * @template T
	 * @param {T} event
	 * @param {object} opts
	 * @param {string} [opts.context]
	 * @param {string} [opts.eventName]
	 * @param {{ key?: string[]}} [opts.params]
	 * @returns
	 */
	runTriggers(event, { context, eventName, params = {} }) {
		if (!this.enabled) return;

		const keys = params.key ?? [];

		const triggers = this.triggers.filter((trigger) => {
			if (trigger.eventName !== eventName) return false;

			if (
				context &&
				trigger.context !== context &&
				trigger.context !== wildcard
			) {
				return false;
			}

			/** @type {string[]} */
			const triggerKeys = trigger.params?.key ?? [];

			// no keys registered = match every key
			return (
				triggerKeys.length === 0 ||
				keys.some((k) => triggerKeys.includes(k))
			);
		});

		triggers.forEach((trigger) => {
			if (trigger.enabled) {
				trigger.run(event);
			}
		});
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}
}
