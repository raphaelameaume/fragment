<script>
	import Trigger from '../triggers/Trigger';
	import FieldTrigger from './FieldTrigger.svelte';
	import ButtonInput from './fields/ButtonInput.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {(Trigger|import('../triggers/Trigger.js').TriggerJSON)[]} triggers
	 * @property {} [onTrigger]
	 * @property {boolean} [triggerable]
	 * @property {boolean} [controllable]
	 */

	/** @type {Props} */
	let {
		triggers = $bindable([]),
		onTrigger,
		triggerable = false,
		controllable = false,
	} = $props();

	/**
	 * @param {number} index
	 */
	function onTriggerDelete(index) {
		if (triggers[index]) {
			triggers.splice(index, 1);
		}
	}

	function handleClickAdd() {
		triggers.push(
			// push TriggerJSON to have reactivity
			new Trigger({
				hot: false,
				enabled: true,
			}).toJSON(),
		);
	}
</script>

{#if onTrigger}
	<div class="field-triggers">
		<header class="header">
			<ButtonInput label="add trigger" onclick={handleClickAdd} />
		</header>
		<div class="triggers-list">
			{#each triggers as _, index}
				<FieldTrigger
					bind:trigger={triggers[index]}
					{index}
					{controllable}
					{triggerable}
					onDelete={onTriggerDelete}
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
		border-color: var(--fragment-spacing-color);
	}

	.field-triggers:before {
		content: '';

		position: absolute;
		left: 10px;
		top: calc(var(--margin) * -1);

		width: 1px;
		height: var(--margin);

		background-color: var(--fragment-spacing-color);
	}

	.header {
		display: flex;
		padding: var(--column-gap);
		border-bottom: 1px solid var(--fragment-spacing-color);
	}
</style>
