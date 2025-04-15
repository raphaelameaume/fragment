<script>
	import Field from './Field.svelte';
	import {
		onNoteOn,
		onNoteOff,
		onNumberOn,
		onNumberOff,
		onControlChange,
	} from '../triggers/MIDI.js';
	import { onMount } from 'svelte';

	let {
		controllable,
		triggerable,
		event,
		registerTrigger,
		enabled,
		params = {},
	} = $props();

	let createTriggersMap = {
		onNoteOn,
		onNoteOff,
		onNumberOn,
		onNumberOff,
		onControlChange,
	};

	let eventName = $state(event);
	let eventOptions = $derived(
		controllable
			? [
					{
						value: undefined,
						label: '-',
						disabled: true,
					},
					{
						value: 'onControlChange',
						label: 'onControlChange',
					},
				]
			: [
					{
						value: undefined,
						label: '-',
						disabled: true,
					},
					{
						value: 'onNoteOn',
					},
					{
						value: 'onNoteOff',
					},
					{
						value: 'onNumberOn',
					},
					{
						value: 'onNumberOff',
					},
				],
	);

	function onEventChange(value) {
		eventName = value;
	}

	// function onEventChange(value) {
	// 	eventName = value;
	// }

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
		key={['onNoteOn', 'onNoteOff'].includes(eventName) ? 'note' : 'number'}
		value={params.key ?? ''}
		onchange={(value) => {
			params.key = value;
		}}
	/>
{/if}
