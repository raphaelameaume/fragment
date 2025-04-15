<script>
	import Field from './Field.svelte';
	import { onMouseDown, onMouseUp, onMouseMove } from '../triggers/Mouse.js';
	import { onMount } from 'svelte';

	let { event, registerTrigger, enabled } = $props();

	let createTriggersMap = {
		onMouseDown,
		onMouseUp,
		onMouseMove,
	};

	let eventName = $state(event);
	let eventOptions = [
		{
			value: undefined,
			label: '-',
		},
		{
			value: 'onMouseDown',
			label: 'onMouseDown',
		},
		{
			value: 'onMouseUp',
			label: 'onMouseUp',
		},
		{
			value: 'onMouseMove',
			label: 'onMouseMove',
		},
	];

	function onEventChange(value) {
		eventName = value;

		dispatchTrigger();
	}

	function dispatchTrigger() {
		let createTrigger = createTriggersMap[eventName];
		registerTrigger(createTrigger);
	}

	onMount(() => {
		if (eventName) {
			dispatchTrigger();
		}
	});
</script>

<Field
	key="event"
	value={eventName}
	params={{
		options: eventOptions,
	}}
	onchange={onEventChange}
/>
