<script>
	import Field from './Field.svelte';
	import { onKeyDown, onKeyUp, onKeyPress } from '../triggers/Keyboard.js';
	import { onMount } from 'svelte';

	let { event, registerTrigger, enabled, params = {} } = $props();

	let createTriggersMap = {
		onKeyDown,
		onKeyUp,
		onKeyPress,
	};

	let eventName = $state(event);
	let eventOptions = [
		{
			value: undefined,
			label: '-',
		},
		{
			value: 'onKeyDown',
			label: 'onKeyDown',
		},
		{
			value: 'onKeyUp',
			label: 'onKeyUp',
		},
		{
			value: 'onKeyPress',
			label: 'onKeyPress',
		},
	];

	function onEventChange(value) {
		eventName = value;

		dispatchTrigger();
	}

	function dispatchTrigger() {
		let createTrigger = createTriggersMap[eventName];
		registerTrigger(createTrigger, params);
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

{#if eventName}
	<Field
		key="key"
		value={params.key ?? ''}
		onchange={(value) => {
			params.key = value;
		}}
	/>
{/if}
