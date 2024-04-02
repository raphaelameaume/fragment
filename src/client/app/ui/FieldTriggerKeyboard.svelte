<script>
	import { createEventDispatcher } from 'svelte';
	import Select from './fields/Select.svelte';
	import TextInput from './fields/TextInput.svelte';
	import Field from './Field.svelte';

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
		value={eventName}
		on:change={(e) => {
			eventName = e.detail;

			dispatch('change', { eventName, ...params });
		}}
	/>
	{#if eventName}
		<Field key="key" value={params.key ?? ''} on:input={onTextChange} />
	{/if}
</div>

<style>
	.field-trigger-keyboard {
		display: grid;
		column-gap: var(--column-gap);
	}
</style>
