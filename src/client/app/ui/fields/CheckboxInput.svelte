<script>
	import { createEventDispatcher } from 'svelte';

	export let value;
	export let context = null;
	export let key = '';
	export let disabled = false;

	const dispatch = createEventDispatcher();

	function handleChange() {
		dispatch('change', value);
	}
</script>

<div class="checkbox">
	<input
		class="input"
		bind:checked={value}
		type="checkbox"
		on:change={handleChange}
		disabled={disabled ? 'disabled' : null}
	/>
	<div class="checked" />
</div>

<style>
	.checkbox {
		position: relative;

		width: var(--height-input);
		height: var(--height-input);
		margin-right: calc(var(--padding));
		box-shadow: inset 0 0 0 1px var(--color-border-input);

		border-radius: var(--border-radius-input);
		background-color: var(--color-background-input);
	}

	.checkbox:hover {
		box-shadow: inset 0 0 0 1px var(--color-active);
	}

	.checkbox:focus-within {
		box-shadow: 0 0 0 2px var(--color-active);
	}

	.input {
		width: 100%;
		height: 100%;
		border: none;
		border-radius: var(--border-radius-input);
		background-color: transparent;
	}

	.checked {
		position: absolute;
		left: 3px;
		top: 3px;
		bottom: 3px;
		right: 3px;

		border-radius: calc(var(--border-radius-input) * 0.5);
		background-color: var(--color-active);

		opacity: 0;
		pointer-events: none;
	}

	.input:checked + .checked {
		opacity: 1;
	}

	.input:checked:disabled + .checked {
		opacity: 0.4;
	}
</style>
