<script>
	import { createEventDispatcher } from 'svelte';
	import Select from './fields/Select.svelte';

	export let eventOptions = [];
	export let eventName = undefined;
	export let params = {
		occurrence: 4 / 4,
		offset: 0,
	};

	const dispatch = createEventDispatcher();
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
			options={[
				{ label: '4/4', value: 4 / 4 },
				{ label: '3/4', value: 3 / 4 },
				{ label: '2/4', value: 2 / 4 },
				{ label: '1/4', value: 1 / 4 },
			]}
			value={params.occurrence}
			on:change={(e) => {
				params.occurrence = e.detail;

				dispatch('change', { eventName, ...params });
			}}
		/>
		<Select
			options={[0, 1, 2, 3]}
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
