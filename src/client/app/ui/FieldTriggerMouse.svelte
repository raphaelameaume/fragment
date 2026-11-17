<script>
	import Mouse from '../inputs/Mouse';
	import Field from './Field.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {import('../triggers/Trigger.js').Trigger} trigger
	 */

	/** @type {Props} */
	let { trigger = $bindable() } = $props();

	let eventName = $derived(trigger.eventName);

	let eventOptions = [
		{
			value: undefined,
			label: '-',
		},
		...Mouse.events.map((e) => ({ value: e.name })),
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
		trigger.eventName = value;
		trigger.enabled = true;
	}}
/>
