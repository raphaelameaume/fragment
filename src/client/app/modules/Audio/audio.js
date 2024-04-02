import { writable } from 'svelte/store';
import { createStore } from '../../stores/utils.js';
import { current } from '../../stores/time.js';
import { get } from 'svelte/store';
import {
	checkForBPMProgressTriggers,
	checkForBPMTriggers,
} from '../../triggers/Audio.js';
import Audio from '../../inputs/Audio.js';

const SOURCE_TYPE_NONE = 'none';
const SOURCE_TYPE_MICROPHONE = 'microphone';

export const SOURCE_TYPES = [SOURCE_TYPE_NONE, SOURCE_TYPE_MICROPHONE];

export const audioSettings = createStore(
	`audioSettings`,
	{
		sourceType: undefined,
		bpm: 120,
		beatsPerMeasure: 4,
	},
	{
		persist: !__BUILD__,
		reset: false,
	},
);

export const audio = createStore(`audio`, {
	measure: 0,
	bar: 0,
});

export const fft = writable(new Uint8Array());

let period;

audioSettings.subscribe(({ bpm, sourceType }) => {
	period = (60 / bpm) * 1000;

	Audio.stop();

	if (sourceType) {
		Audio.start(sourceType);
	}
});

Audio.onUpdate((data) => {
	fft.set(data);
});

let elapsed = 0;
let paused = false;

function onBPM(
	{ bar, measure } = get(audio),
	{ beatsPerMeasure } = get(audioSettings),
) {
	checkForBPMTriggers({ bar, measure, beatsPerMeasure });
}

current.subscribe(({ time, deltaTime }) => {
	elapsed += deltaTime;

	const { beatsPerMeasure } = get(audioSettings);

	if (elapsed > period) {
		elapsed = 0;
		audio.update((current) => {
			const bar = current.bar < beatsPerMeasure - 1 ? current.bar + 1 : 0;
			let measure = bar === 0 ? current.measure + 1 : current.measure;
			measure %= 4;

			onBPM({ bar, measure });

			return {
				...current,
				bar,
				measure,
			};
		});
	}

	const playhead = elapsed / period;
	const { bar, measure } = get(audio);
	checkForBPMProgressTriggers({ bar, measure, beatsPerMeasure, playhead });
});

export function resync() {
	elapsed = 0;

	audio.update((current) => ({
		...current,
		measure: 0,
		bar: 0,
	}));
}

let lastTap = performance.now();
let taps = [];

export function tap() {
	let now = performance.now();
	let deltaTap = now - lastTap;

	if (deltaTap < 2000) {
		taps.push(deltaTap);

		let deltaAverage = taps.reduce((acc, c) => acc + c, 0) / taps.length;

		audioSettings.update((current) => ({
			...current,
			bpm: Math.round((60 / deltaAverage) * 1000),
		}));

		resync();
	} else {
		taps = [];
	}

	lastTap = now;
}
