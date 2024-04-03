<script>
	import { createEventDispatcher } from 'svelte';
	import Select from './fields/Select.svelte';
	import { audioSettings } from '../modules/Audio/audio';
	import Field from './Field.svelte';

	export let eventOptions = [];
	export let eventName = undefined;
	export let params = {
		repetition: 1,
		direction: 1,
		offset: 0,
	};

	if (!params.repetition) {
		params.repetition = 1;
	}

	if (!params.direction) {
		params.direction = 1;
	}

	const dispatch = createEventDispatcher();

	let repetitionOptions = [];
	let offsetOptions = [];

	$: console.log(params.repetition);

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

		dispatch('change', { eventName, ...params });
	});
</script>

<div
	class="field-trigger-audio"
	class:event-selected={eventName !== undefined}
	class:bpm={eventName === 'onBPM'}
	class:bpm-progress={eventName === 'onBPMProgress'}
>
	<Select
		options={eventOptions}
		bind:value={eventName}
		on:change={(e) => {
			eventName = e.detail;

			dispatch('change', { eventName, ...params });
		}}
	/>
	{#if eventName === 'onBPM' || eventName === 'onBPMProgress'}
		{#if eventName === 'onBPMProgress'}
			<Field
				key="direction"
				params={{ label: params.direction > 0 ? '>' : '<' }}
				value={() => {
					params.direction = -params.direction;
					dispatch('change', { eventName, ...params });
				}}
			/>
		{/if}
		<Field
			key="repetition"
			params={{ options: repetitionOptions }}
			value={params.repetition}
			on:change={(e) => {
				params.repetition = e.detail;

				if (params.repetition === -1) {
					params.offset = 0;
				}

				dispatch('change', { eventName, ...params });
			}}
		/>
		{#if params.repetition !== 1}
			<Field
				key="offset"
				params={{
					options: offsetOptions.filter((opt) =>
						params.repetition === -1 ? opt < 2 : true,
					),
				}}
				value={params.offset}
				on:change={(e) => {
					params.offset = e.detail;

					dispatch('change', { eventName, ...params });
				}}
			/>
		{/if}
	{/if}
</div>

<style>
	.field-trigger-audio {
		display: grid;
		grid-template-columns: 1fr;
		column-gap: var(--column-gap);
	}
</style>
