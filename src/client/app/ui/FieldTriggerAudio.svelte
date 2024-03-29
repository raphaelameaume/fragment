<script>
	import { createEventDispatcher } from 'svelte';
	import Select from './fields/Select.svelte';
	import { audioSettings } from '../modules/Audio/audio';

	export let eventOptions = [];
	export let eventName = undefined;
	export let params = {
		repetition: 4 / 4,
		offset: 0,
	};

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

		offsetOptions = repetitionOptions.map((opt, index) => {
			return index;
		});

		// match existing repetition and offset if value exists in the new options
		let occurenceIndex = repetitionOptions.findIndex(
			(opt) => opt.value === params.repetition,
		);

		let offset = offsetOptions.find((offset) => offset === params.offset);

		// or fallback to first option if no match
		if (occurenceIndex < 0) {
			occurenceIndex = 0;
		}

		if (!offset) {
			offset = 0;
		}

		params.repetition = repetitionOptions[occurenceIndex].value;
		params.offset = offset;

		dispatch('change', { eventName, ...params });
	});
</script>

<div
	class="field-trigger-audio"
	class:event-selected={eventName !== undefined}
	class:bpm={eventName === 'onBPM'}
>
	<Select
		options={eventOptions}
		bind:value={eventName}
		on:change={(e) => {
			eventName = e.detail;

			dispatch('change', { eventName });
		}}
	/>
	{#if eventName === 'onBPM'}
		<Select
			options={repetitionOptions}
			value={params.repetition}
			on:change={(e) => {
				params.repetition = e.detail;

				dispatch('change', { eventName, ...params });
			}}
		/>
		<Select
			options={offsetOptions}
			value={params.offset}
			on:change={(e) => {
				params.offset = e.detail;

				dispatch('change', { eventName, ...params });
			}}
		/>
	{/if}
</div>

<style>
	.field-trigger-audio {
		display: grid;
		grid-template-columns: 1fr;
		column-gap: var(--column-gap);
	}

	.field-trigger-audio.bpm {
		grid-template-columns: 1fr 0.5fr 0.5fr;
	}
</style>
