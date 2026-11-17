<script>
	import MIDI, { notes } from '@fragment/inputs/MIDI';
	import Field from './Field.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {import('../triggers/Trigger.js').Trigger} trigger
	 * @property {boolean} controllable
	 */

	/** @type {Props} */
	let { trigger = $bindable(), controllable } = $props();

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
					...MIDI.events
						.filter((e) => e.controllable)
						.map((event) => ({
							value: event.name,
						})),
				]
			: [
					{
						value: undefined,
						label: '-',
						disabled: true,
					},
					...MIDI.events
						.filter((e) => e.triggerable)
						.map((event) => ({
							value: event.name,
						})),
				],
	);
</script>

<Field
	key="event"
	value={eventName}
	disabled={trigger.hot}
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
		disabled={trigger.hot}
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

{#if ['onNumberOn', 'onNumberOff', 'onControlChange'].includes(eventName)}
	<Field
		key="number"
		value={keys}
		disabled={trigger.hot}
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
