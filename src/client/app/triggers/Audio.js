import Trigger from './Trigger';
import { wildcard, getContext } from './shared.js';
import { addToMapArray, removeFromMapArray } from '../utils';

export const bpms = new Map();
export const measures = new Map();

export const reset = (context) => {
	bpms.delete(context);
	measures.delete(context);
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

const checkForTriggers = (collection, event, scope) => {
	const triggers = [
		...(collection.has(scope) ? collection.get(scope) : []),
		...(collection.has(wildcard) ? collection.get(wildcard) : []),
	];

	triggers.forEach((trigger) => {
		trigger.run(event);
	});
};

/**
 *
 * @param {Map} collection
 * @returns
 */
const createTrigger = (eventName, collection) => {
	return (
		fn,
		{ context, hot, enabled, occurrence = 4 / 4, offset = 0 } = {},
	) => {
		try {
			if (!context) {
				context = getContext();
			}

			console.log({ occurrence });

			const trigger = new Trigger({
				inputType: 'Audio',
				eventName,
				fn,
				params: { context, occurrence, offset },
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
export const onMeasure = createTrigger('onMeasure', measures);
export const fft = createTrigger('fft');

export const triggers = {
	onBPM,
};
