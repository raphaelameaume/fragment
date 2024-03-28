import { derived, readable } from 'svelte/store';
import { createStore } from '../../stores/utils.js';
import { current } from '../../stores/time.js';
import { get } from 'svelte/store';
import { bpms } from '../../triggers/Audio.js';
import { tick } from 'svelte';

export const audioSettings = createStore(
	`audioSettings`,
	{
		bpm: 120,
		beatsPerMeasure: 4,
	},
	{
		persist: !__BUILD__,
		reset: true,
	},
);

export const audio = createStore(`audio`, {
	measure: 0,
	bar: 0,
});

let period;

audioSettings.subscribe(({ bpm }) => {
	period = (60 / bpm) * 1000;
});

let elapsed = 0;
let currentTime = 0;
let paused = false;

function onBPM(
	{ bar, measure } = get(audio),
	{ beatsPerMeasure } = get(audioSettings),
) {
	for (const [context, triggers] of bpms) {
		triggers.forEach((trigger) => {
			const { occurrence, offset } = trigger.params;

			const shouldRun =
				occurrence === 1 ||
				(occurrence === 2 / beatsPerMeasure &&
					(bar + offset) % 2 === 0);

			if (shouldRun) {
				trigger.run();
			}
		});
	}
}

audio.subscribe(({ measure, bar }) => {
	onBPM({ bar, measure });
});

current.subscribe(({ time, deltaTime }) => {
	currentTime = time;

	elapsed += deltaTime;

	if (elapsed > period) {
		elapsed = 0;

		audio.update((current) => {
			const bar =
				current.bar < get(audioSettings).beatsPerMeasure - 1
					? current.bar + 1
					: 0;
			let measure = bar === 0 ? current.measure + 1 : current.measure;
			measure %= 4;

			return {
				...current,
				bar,
				measure,
			};
		});
	}
});

export function resync() {
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
