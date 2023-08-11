<script>
	import { createEventDispatcher } from 'svelte';

	export let label = null;
	export let value;
	export let disabled = false;
	export let context = null;
	export let key = '';

	let node;

	const dispatch = createEventDispatcher();

	function onKeyPress(event) {
		if (event.key === 'Enter') {
			node.blur();
		}
	}

	function handleInput(event) {
		dispatch('input', event.currentTarget.value);
	}

	function handleChange(event) {
		dispatch('change', event.currentTarget.value);
	}
</script>

<div class="input-container" class:disabled>
	{#if label}
		<span class="label">{label}</span>
	{/if}
	<input
		class="input"
		bind:this={node}
		bind:value
		on:change={handleChange}
		on:input={handleInput}
		on:keypress={onKeyPress}
		on:keydown
		on:focus
		on:blur
		disabled={disabled ? 'disabled' : null}
		autocomplete="off"
		spellcheck="false"
	/>
</div>

<style>
	.input-container {
		position: relative;

		display: flex;
		height: var(--height-input);
		margin: 2px 0;

		border-radius: var(--border-radius-input);
		background-color: var(--color-background-input);
		box-shadow: inset 0 0 0 1px var(--color-border-input);
	}

	.input-container:not(.disabled):hover {
		box-shadow: inset 0 0 0 1px var(--color-active);
	}

	.input-container:not(.disabled):focus-within {
		box-shadow: 0 0 0 2px var(--color-active);
	}

	.label {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;

		display: flex;
		align-items: center;
		padding: var(--padding);

		color: var(--color-text);
		font-size: var(--font-size-input);
		font-weight: 600;
		pointer-events: none;
		opacity: 0.35;
	}

	.input-container.disabled .label {
		opacity: 0.1;
	}

	.input {
		width: 100%;
		height: 100%;
		padding: 0 var(--padding);

		color: var(--color-text-input);
		font-size: var(--font-size-input);
		text-align: right;

		background: transparent;
		outline: 0;
	}

	.input:disabled {
		color: var(--color-text-input-disabled);
	}

	.input:focus {
		color: var(--color-text);
	}

	/* .input:focus {
    border: var(--borderWidth) solid var(--color-active);
} */
</style>
