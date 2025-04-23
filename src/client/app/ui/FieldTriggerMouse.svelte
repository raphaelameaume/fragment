<script>
	import Field from './Field.svelte';

	let { trigger } = $props();

	let eventName = $derived(trigger.eventName);

	let eventOptions = [
		{
			value: undefined,
			label: '-',
		},
		{
			value: 'onMouseDown',
		},
		{
			value: 'onMouseUp',
		},
		{
			value: 'onMouseMove',
		},
		{
			value: 'onClick',
		},
	];
</script>

<Field
	key="event"
	value={eventName}
	params={{
		options: eventOptions,
	}}
	onchange={(value) => {
		trigger.eventName = value;
	}}
/>
