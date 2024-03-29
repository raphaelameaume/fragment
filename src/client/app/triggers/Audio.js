import Trigger from './Trigger';
import { wildcard, getContext } from './shared.js';
import { addToMapArray, removeFromMapArray } from '../utils';

export const bpms = new Map();

export const reset = (context) => {
	bpms.delete(context);
};

export const removeHotListeners = (context) => {
	function removeHotFrom(collection) {
		const triggers = collection.get(context);

		if (triggers && triggers.length > 0) {
			const hotListeners = triggers.filter((t) => t.hot);
			const rest = triggers.filter((t) => !t.hot);

			hotListeners.forEach((t) => t.destroy());

			collection.set(context, rest);
		}
	}

	removeHotFrom(bpms);
};

export const checkForTriggers = ({ bar, measure, beatsPerMeasure }) => {
	for (const [, triggers] of bpms) {
		triggers.forEach((trigger) => {
			const { repetition, offset } = trigger.params;

			const shouldRun =
				repetition === 1 ||
				(repetition === 2 / beatsPerMeasure &&
					(bar + offset) % 2 === 0);

			if (shouldRun) {
				trigger.run({ bar, measure, beatsPerMeasure });
			}
		});
	}
};
/**
 *
 * @param {Map} collection
 * @returns
 */
const createTrigger = (eventName, collection) => {
	return (
		fn,
		{ context, hot, enabled, repetition = 4 / 4, offset = 0 } = {},
	) => {
		try {
			if (!context) {
				context = getContext();
			}

			const trigger = new Trigger({
				inputType: 'Audio',
				eventName,
				fn,
				params: { context, repetition, offset },
				context,
				hot,
				enabled,
				destroy: () => {
					removeFromMapArray(
						collection,
						context,
						(item) => item.id === trigger.id,
					);
				},
			});

			addToMapArray(collection, context, trigger);

			return trigger;
		} catch (error) {
			console.error(error);

			return null;
		}
	};
};

export const onBPM = createTrigger('onBPM', bpms);
export const fft = createTrigger('fft');

export const triggers = {
	onBPM,
};
