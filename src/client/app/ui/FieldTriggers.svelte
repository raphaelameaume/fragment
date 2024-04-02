<script>
	import FieldTrigger from './FieldTrigger.svelte';
	import ButtonInput from './fields/ButtonInput.svelte';

	export let context;
	export let onTrigger;
	export let triggers;
	export let triggerable = false;
	export let controllable = false;

	function onTriggerDelete(e) {
		const triggerIndex = e.detail;

		$triggers = $triggers.filter((t, i) => i !== triggerIndex);
	}

	function handleClickAdd() {
		triggers.update((current) => {
			return [
				...current,
				{
					inputType: undefined,
					eventName: undefined,
				},
			];
		});
	}
</script>

{#if onTrigger}
	<div class="field-triggers">
		<ButtonInput label="add trigger" on:click={handleClickAdd} />
		{#each $triggers as trigger, index}
			<FieldTrigger
				{index}
				bind:inputType={trigger.inputType}
				bind:eventName={trigger.eventName}
				bind:params={trigger.params}
				bind:enabled={trigger.enabled}
				{onTrigger}
				{context}
				{controllable}
				{triggerable}
				on:delete={onTriggerDelete}
			/>
		{/each}
	</div>
{/if}

<style>
	.field-triggers {
		width: 100%;
		padding: var(--column-gap);
		margin-top: var(--column-gap);
		border: 1px solid var(--color-spacing);
	}
</style>
