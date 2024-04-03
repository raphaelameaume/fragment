<script>
	import { createEventDispatcher } from 'svelte';
	import Select from './fields/Select.svelte';

	export let eventOptions = [];
	export let eventName = undefined;

	const dispatch = createEventDispatcher();
</script>

<div class="field-trigger-mouse">
	<Select
		options={eventOptions}
		bind:value={eventName}
		on:change={(e) => {
			eventName = e.detail;
			dispatch('change', { eventName });
		}}
	/>
</div>

<style>
	.field-trigger-mouse {
		display: grid;

		--align-items: center;
	}
</style>
