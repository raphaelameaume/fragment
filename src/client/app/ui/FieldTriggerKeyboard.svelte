<script>
	import Keyboard from '../inputs/Keyboard.js';
	import Field from './Field.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {import('../triggers/Trigger.js').Trigger} trigger
	 */

	/** @type {Props} */
	let { trigger = $bindable() } = $props();

	let eventName = $derived(trigger.eventName);
	let keys = $derived((trigger.params?.key ?? []).join(','));
	let eventOptions = [
		{
			value: undefined,
			label: '-',
			disabled: true,
		},
		...Keyboard.events.map((e) => ({ value: e.name })),
	];
</script>

<Field
	key="event"
	value={eventName}
	disabled={trigger.hot}
	params={{
		options: eventOptions,
	}}
	onchange={(value) => {
		eventName = value;
		trigger.eventName = value;
	}}
/>

{#if eventName}
	<Field
		key="key"
		disabled={trigger.hot}
		value={keys}
		onchange={(event) => {
			if (!trigger.params?.key) {
				trigger.params = { key: [] };
			}

			trigger.params.key = event.currentTarget.value
				.trim()
				.split(',')
				.map((v) => v.trim());
		}}
	/>
{/if}
