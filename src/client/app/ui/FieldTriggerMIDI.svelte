<script>
	import { createEventDispatcher } from 'svelte';
	import Select from './fields/Select.svelte';
	import TextInput from './fields/TextInput.svelte';

	export let eventOptions = [];
	export let eventName = undefined;
	export let params = {
		key: '',
	};

	const dispatch = createEventDispatcher();
	const isEventNote = (name = '') => name.includes('Note');

	function onTextChange(e) {
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
				params.key = '';
			}

			eventName = e.detail;
		}}
	/>
	<TextInput
		value={params.key}
		label={isEventNote(eventName) ? 'note' : 'number'}
		on:input={onTextChange}
	/>
</div>

<style>
	.field-trigger-midi {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: var(--column-gap);
	}
</style>
