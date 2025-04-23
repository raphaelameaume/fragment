<script>
	import Field from './Field.svelte';

	let { trigger } = $props();

	$inspect(trigger.params);

	let eventName = $derived(trigger.eventName);
	let keys = $derived((trigger.params?.key ?? []).join(','));
	let eventOptions = [
		{
			value: undefined,
			label: '-',
			disabled: true,
		},
		{
			value: 'onKeyDown',
		},
		{
			value: 'onKeyUp',
		},
		{
			value: 'onKeyPress',
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

{#if eventName}
	<Field
		key="key"
		value={keys}
		onchange={(event) => {
			console.log(
				event.currentTarget.value
					.trim()
					.split(',')
					.map((v) => v.trim()),
			);

			trigger.params.key = event.currentTarget.value
				.trim()
				.split(',')
				.map((v) => v.trim());
		}}
	/>
{/if}
