<script>
	import Trigger from '../triggers/Trigger';
	import FieldGroup from './FieldGroup.svelte';
	import FieldTrigger from './FieldTrigger.svelte';
	import ButtonInput from './fields/ButtonInput.svelte';

	let {
		context,
		onTrigger,
		triggerable = false,
		controllable = false,
	} = $props();

	let inputTypes = $state([]);
	let triggers = $state([]);

	function onTriggerDelete(triggerIndex) {
		triggers.splice(triggerIndex, 1);
		// triggers = triggers.filter((t, i) => i !== triggerIndex);
	}

	$inspect(triggers);

	function handleClickAdd() {
		inputTypes.push(undefined);
	}
</script>

{#if onTrigger}
	<div class="field-triggers">
		<header class="header">
			<ButtonInput label="add trigger" onclick={handleClickAdd} />
		</header>
		<div class="triggers-list">
			{#each triggers as trigger, index}
				<FieldTrigger
					bind:trigger={triggers[index]}
					{index}
					{onTrigger}
					{context}
					{controllable}
					{triggerable}
					onchange={(index, trigger) => {
						if (triggers[index]) {
							console.log(triggers[index]);
							// triggers[index].destroy();
						}

						triggers[index] = trigger;
					}}
					onDelete={(trigger) => {
						const index = triggers.findIndex((t) => t === trigger);

						if (index >= 0) {
							triggers.splice(index, 1);
						}
					}}
				/>
			{/each}
		</div>
	</div>
{/if}

<style>
	.field-triggers {
		--margin: 15px;
		position: relative;
		width: 100%;
		padding: 0px 0px;
		margin-top: var(--margin);
		margin-bottom: var(--column-gap);
		border-width: 1px 1px 0px 1px;
		border-style: solid;
		border-color: var(--color-spacing);
	}

	.field-triggers:before {
		content: '';

		position: absolute;
		left: 10px;
		top: calc(var(--margin) * -1);

		width: 1px;
		height: var(--margin);

		background-color: var(--color-spacing);
	}

	.header {
		display: flex;
		padding: var(--column-gap);
		border-bottom: 1px solid var(--color-spacing);
	}

	.field-triggers:not(:empty) {
		/* margin-top: var(--column-gap); */
	}
</style>
