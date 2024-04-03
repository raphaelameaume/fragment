import Trigger from './Trigger';
import { getContext } from './shared.js';
import { addToMapArray, removeFromMapArray } from '../utils';
import Audio from '../inputs/Audio.js';

export const bpms = new Map();
export const bpmProgress = new Map();
export const ffts = new Map();

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
	removeHotFrom(bpmProgress);
	removeHotFrom(ffts);
};

const createTriggerValidation = ({ beatsPerMeasure }) => {
	const barIndices = Array.from({ length: beatsPerMeasure }).map(
		(v, index) => index,
	);

	return (trigger, bar) => {
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

			if (repetition === -1) {
				validBarIndices = [0, 2];
			}

			// handle offset
			validBarIndices = validBarIndices.map(
				(index) => (index + offset) % beatsPerMeasure,
			);
		}

		return validBarIndices.includes(bar);
	};
};

export const checkForBPMTriggers = ({ bar, measure, beatsPerMeasure }) => {
	const isTriggerValid = createTriggerValidation({ beatsPerMeasure });

	for (const [, triggers] of bpms) {
		triggers.forEach((trigger) => {
			if (isTriggerValid(trigger, bar)) {
				trigger.run({ bar, measure, beatsPerMeasure });
			}
		});
	}
};

export const checkForFFTTriggers = (data) => {
	const getMean = (data = [], start = 0, end = data.length) => {
		const cols = data.slice(start, end);

		return (
			data.reduce((sum, freq) => {
				sum += freq / 256.0;

				return sum;
			}, 0) / cols.length
		);
	};

	const total = getMean(data);

	for (const [, triggers] of ffts) {
		triggers.forEach((trigger) => {
			const { fftRange, gain } = trigger.params;

			let mean = total;

			if (fftRange[0] !== 0 || fftRange[1] !== data.length) {
				mean = getMean(data, fftRange[0], fftRange[1]);
			}

			mean *= gain;

			const isTriggerValid = true;
			if (isTriggerValid) {
				trigger.run({
					value: mean,
				});
			}
		});
	}
};

export const checkForBPMProgressTriggers = ({
	bar,
	measure,
	beatsPerMeasure,
	playhead,
}) => {
	const isTriggerValid = createTriggerValidation({ beatsPerMeasure });

	for (const [, triggers] of bpmProgress) {
		triggers.forEach((trigger) => {
			if (isTriggerValid(trigger, bar)) {
				const value =
					trigger.params.direction > 0 ? playhead : 1 - playhead;

				trigger.run({
					...trigger.params,
					bar,
					measure,
					beatsPerMeasure,
					value,
					playhead,
				});
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
		{
			context,
			hot,
			enabled,
			direction = 1,
			repetition = 4 / 4,
			offset = 1,
			fftRange = [0, Audio.bufferLength],
			gain = 1,
		} = {},
	) => {
		try {
			if (!context) {
				context = getContext();
			}

			const trigger = new Trigger({
				inputType: 'Audio',
				eventName,
				fn,
				params: {
					context,
					repetition,
					offset,
					direction,
					fftRange,
					gain,
				},
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

export const TRIGGERS = {
	onBPM: {
		name: 'onBPM',
		controllable: false,
		triggerable: true,
	},
	onBPMProgress: {
		name: 'onBPMProgress',
		controllable: true,
		triggerable: false,
	},
	onFFT: {
		name: 'onFFT',
		controllable: true,
		triggerable: false,
	},
};

export const onBPM = createTrigger(TRIGGERS.onBPM.name, bpms);
export const onBPMProgress = createTrigger(
	TRIGGERS.onBPMProgress.name,
	bpmProgress,
);
export const onFFT = createTrigger(TRIGGERS.onFFT.name, ffts);
