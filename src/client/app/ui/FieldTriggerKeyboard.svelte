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

	function onTextChange(e) {
		params.key = e.detail;

		dispatch('change', { eventName, ...params });
	}
</script>

<div class="field-trigger-keyboard">
	<Select
		options={eventOptions}
		bind:value={eventName}
		on:change={(e) => {
			eventName = e.detail;
		}}
	/>
	<TextInput bind:value={params.key} label="key" on:input={onTextChange} />
</div>

<style>
	.field-trigger-keyboard {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: var(--column-gap);
	}
</style>
