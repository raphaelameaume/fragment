<script>
	import { createEventDispatcher } from 'svelte';
	import Select from './fields/Select.svelte';
	import Field from './Field.svelte';
	import { notes } from '../inputs/MIDI.js';

	export let eventOptions = [];
	export let eventName = undefined;
	export let params = {
		key: '',
	};

	const dispatch = createEventDispatcher();
	const isEventNote = (name = '') => name.includes('Note');

	function onKeyChange(e) {
		params.key = e.detail;

		dispatch('change', { eventName, ...params });
	}
</script>

<div class="field-trigger-midi">
	<Select
		options={eventOptions}
		value={eventName}
		on:change={(e) => {
			const isPreviousNote = isEventNote(eventName);
			const isCurrentNote = isEventNote(e.detail);

			if (isPreviousNote !== isCurrentNote) {
				params.key = isCurrentNote ? notes[0] : '';
			}

			eventName = e.detail;

			dispatch('change', { eventName, ...params });
		}}
	/>
	{#if eventName}
		{#if eventName.includes('onNote')}
			<Field
				key="note"
				value={params.key}
				params={{ options: notes }}
				on:change={onKeyChange}
			/>
		{:else}
			<Field key="number" value={params.key} on:input={onKeyChange} />
		{/if}
	{/if}
</div>

<style>
	.field-trigger-midi {
		display: grid;
		grid-template-columns: 1fr;
		column-gap: var(--column-gap);
	}
</style>
