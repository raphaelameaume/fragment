<script>
	import Field from './Field.svelte';
	import Mouse from '../inputs/Mouse.js';
	import Trigger from '../triggers/Trigger';

	let { onTrigger } = $props();

	let eventName = $state(undefined);
	/** @type {Trigger} */
	let trigger;

	$effect(() => {
		if (trigger) {
			const prevCollection = Mouse.getTriggers(eventName);
			const triggerIndex = prevCollection?.findIndex(
				(t) => t === trigger,
			);

			if (triggerIndex >= 0) {
				prevCollection.splice(triggerIndex, 1);
			}
		}

		if (eventName) {
			trigger = new Trigger({
				inputType: 'Mouse',
				eventName,
				onTrigger,
			});

			const newCollection = Mouse.getTriggers(eventName);
			newCollection.push(trigger);
		}
	});
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
		eventName = value;
	}}
/>
