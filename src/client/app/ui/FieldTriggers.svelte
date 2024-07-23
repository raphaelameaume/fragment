<script>
	import FieldTrigger from './FieldTrigger.svelte';
	import ButtonInput from './fields/ButtonInput.svelte';

	let {
		context,
		onTrigger,
		triggers = $bindable(),
		triggerable = false,
		controllable = false,
	} = $props();

	function onTriggerDelete(triggerIndex) {
		triggers.splice(triggerIndex, 1);
		// triggers = triggers.filter((t, i) => i !== triggerIndex);
	}

	function handleClickAdd() {
		triggers.push({
			inputType: undefined,
			eventName: undefined,
			enabled: false,
			params: {},
		});
	}
</script>

{#if onTrigger}
	<ButtonInput label="add trigger" onclick={handleClickAdd} />
	<div class="field-triggers">
		{#each triggers as trigger, index}
			<FieldTrigger
				{index}
				inputType={trigger.inputType}
				eventName={trigger.eventName}
				params={trigger.params}
				enabled={trigger.enabled}
				{onTrigger}
				{context}
				{controllable}
				{triggerable}
				onchange={(index, trigger) => {
					triggers[index] = trigger;
				}}
				onDelete={onTriggerDelete}
			/>
		{/each}
	</div>
{/if}

<style>
	.field-triggers {
		width: 100%;
	}

	.field-triggers:not(:empty) {
		margin-top: var(--column-gap);
	}
</style>
