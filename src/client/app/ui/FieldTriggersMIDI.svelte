<script>
	import { notes } from '@fragment/inputs/MIDI';
	import Field from './Field.svelte';

	let { controllable, trigger = $bindable() } = $props();

	let eventName = $derived(trigger.eventName);
	let keys = $derived((trigger.params?.key ?? []).join(','));
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
</script>

<Field
	key="event"
	value={eventName}
	params={{
		options: eventOptions,
	}}
	onchange={(value) => {
		if (
			eventName &&
			((eventName.includes('Note') && value.includes('Number')) ||
				(eventName.includes('Number') && value.includes('Note')))
		) {
			trigger.params.key = [];
		}

		eventName = value;
		trigger.eventName = value;
	}}
/>

{#if ['onNoteOn', 'onNoteOff'].includes(eventName)}
	<Field
		key="note"
		value={keys}
		params={{
			options: [
				{
					value: undefined,
					label: '*',
				},
				...notes.map((note) => ({
					value: note,
				})),
			],
		}}
		onchange={(value) => {
			trigger.params.key = value
				.trim()
				.split(',')
				.map((v) => v.trim());
		}}
	/>
{/if}

{#if ['onNumberOn', 'onNumberOff'].includes(eventName)}
	<Field
		key="number"
		value={keys}
		onchange={(event) => {
			trigger.params.key = event.currentTarget.value
				.trim()
				.split(',')
				.map((v) => v.trim());
		}}
	/>
{/if}
