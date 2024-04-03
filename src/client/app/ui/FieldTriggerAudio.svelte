<script>
	import { createEventDispatcher } from 'svelte';
	import Select from './fields/Select.svelte';
	import { audioSettings } from '../modules/Audio/audio';
	import Field from './Field.svelte';
	import { TRIGGERS, onFFT } from '../triggers/Audio.js';
	import Audio from '../inputs/Audio.js';

	export let eventOptions = [];
	export let eventName = undefined;
	export let params = {
		repetition: 1,
		direction: 1,
		offset: 0,
		fftRange: [0, Audio.bufferLength],
		gain: 1,
	};

	if (!params.repetition) {
		params.repetition = 1;
	}

	if (!params.direction) {
		params.direction = 1;
	}

	if (!params.fftRange) {
		params.fftRange = [0, Audio.bufferLength];
	}

	if (!params.gain) {
		params.gain = 1;
	}

	const dispatch = createEventDispatcher();

	let repetitionOptions = [];
	let offsetOptions = [];

	audioSettings.subscribe(({ beatsPerMeasure }) => {
		repetitionOptions = Array.from({ length: beatsPerMeasure }).map(
			(v, index) => {
				return {
					label: `${beatsPerMeasure - index}/${beatsPerMeasure}`,
					value: (beatsPerMeasure - index) / beatsPerMeasure,
				};
			},
		);

		if (beatsPerMeasure === 4) {
			repetitionOptions = [
				...repetitionOptions,
				{ label: 'every 2', value: -1 },
			];
		}

		offsetOptions = Array.from({ length: beatsPerMeasure }).map(
			(opt, index) => {
				return index;
			},
		);

		// match existing repetition and offset if value exists in the new options
		let repetitionIndex = repetitionOptions.findIndex(
			(opt) => opt.value === params.repetition,
		);

		let offset = offsetOptions.find((offset) => offset === params.offset);

		// or fallback to first option if no match
		if (repetitionIndex < 0) {
			repetitionIndex = 0;
		}

		if (!offset) {
			params.offset = 0;
		}

		if (params.repetition === undefined) {
			params.repetition = repetitionOptions[repetitionIndex].value;
		}
	});

	const dispatchChange = () => dispatch('change', { eventName, ...params });
	const updateParam = (key, value) => {
		params[key] = value;
		dispatchChange();
	};
</script>

<div
	class="field-trigger-audio"
	class:event-selected={eventName !== undefined}
	class:bpm={eventName === TRIGGERS.onBPM.name}
	class:bpm-progress={eventName === TRIGGERS.onBPMProgress.name}
>
	<Select
		options={eventOptions}
		bind:value={eventName}
		on:change={(e) => {
			eventName = e.detail;

			dispatchChange();
		}}
	/>
	{#if eventName === TRIGGERS.onBPM.name || eventName === TRIGGERS.onBPMProgress.name}
		{#if eventName === TRIGGERS.onBPMProgress.name}
			<Field
				key="direction"
				params={{
					label: params.direction > 0 ? '>' : '<',
					triggerable: false,
				}}
				value={() => {
					updateParam('direction', -params.direction);
				}}
			/>
		{/if}
		<Field
			key="repetition"
			params={{ options: repetitionOptions, triggerable: false }}
			value={params.repetition}
			on:change={(e) => {
				params.repetition = e.detail;

				if (params.repetition === -1) {
					params.offset = 0;
				}

				dispatchChange();
			}}
		/>
		{#if params.repetition !== 1}
			<Field
				key="offset"
				params={{
					options: offsetOptions.filter((opt) =>
						params.repetition === -1 ? opt < 2 : true,
					),
					triggerable: false,
				}}
				value={params.offset}
				on:change={(e) => updateParam('offset', e.detail)}
			/>
		{/if}
	{/if}
	{#if eventName === TRIGGERS.onFFT.name}
		<Field
			key="fftRange"
			displayName="range"
			value={params.fftRange}
			params={{ min: 0, max: Audio.bufferLength, step: 1 }}
			on:change={(e) => updateParam('fftRange', e.detail)}
		/>
		<Field
			key="fftGain"
			displayName="gain"
			value={params.gain * 100}
			params={{ min: 0, max: 100, step: 1 }}
			on:change={(e) => updateParam('gain', e.detail / 100)}
		/>
	{/if}
</div>

<style>
	.field-trigger-audio {
		display: grid;
		grid-template-columns: 1fr;
		column-gap: var(--column-gap);

		--align-items: center;
	}
</style>
