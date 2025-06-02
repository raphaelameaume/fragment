import { Inputs } from '../inputs';
import Trigger from '../triggers/Trigger';
import { map } from '../utils/math.utils';

const createOnTriggerCallback = (callback, { min, max, step = 1 } = {}) => {
	return (event) => {
		const isValueInRange =
			typeof event.value === 'number' &&
			event.value >= 0 &&
			event.value <= 1;
		if (isValueInRange && isFinite(min) && isFinite(max)) {
			let v = map(event.value, 0, 1, min, max);
			let value = Math.round(v * (1 / step)) / (1 / step);

			callback(value);
		} else {
			callback();
		}
	};
};

export function registerTriggers(triggersList, callback, params) {
	$effect(() => {
		const triggers = [];

		triggersList.forEach((t) => {
			const trigger = new Trigger({
				...t,
				fn: createOnTriggerCallback(callback, params),
				enabled: true,
			});

			triggers.push(trigger);
		});

		triggers.forEach((trigger) => {
			Inputs.forEach((input) => {
				if (trigger.inputType === input.type) {
					input.add(trigger);
				}
			});
		});

		return () => {
			triggers.forEach((trigger) => {
				Inputs.forEach((input) => {
					if (trigger.inputType === input.type) {
						input.remove(trigger);
					}
				});
			});

			if (params?.context) {
				Inputs.forEach((input) => {
					const hotListeners = input.triggers.filter(
						(trigger) => trigger.context === params.context,
					);

					hotListeners.forEach((trigger) => input.remove(trigger));
				});
			}
		};
	});
}
