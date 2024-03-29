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
	const barIndices = Array.from({ length: beatsPerMeasure }).map(
		(v, index) => index,
	);

	for (const [, triggers] of bpms) {
		triggers.forEach((trigger) => {
			const { repetition, offset } = trigger.params;

			let validBarIndices = [...barIndices];

			if (repetition !== 1) {
				// the more the repetition, the more indices
				const r = (1 - repetition) * beatsPerMeasure;

				validBarIndices = validBarIndices.slice(
					0,
					validBarIndices.length - r,
				);

				// handle 2 / 4 without affecting others
				validBarIndices = validBarIndices.map((index) => index * r);

				// handle offset
				validBarIndices = validBarIndices.map(
					(index) => (index + offset) % beatsPerMeasure,
				);
			}

			if (validBarIndices.includes(bar)) {
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
