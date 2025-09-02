<script>
	let {
		value = $bindable(),
		context,
		key = '',
		disabled = false,
		onchange,
	} = $props();

	const handleChange = (event) => {
		onchange(value);
	};
</script>

<div class="checkbox">
	<input
		class="input"
		bind:checked={value}
		type="checkbox"
		onchange={handleChange}
		disabled={disabled ? 'disabled' : null}
	/>
	<div class="checked" />
</div>

<style>
	.checkbox {
		position: relative;

		width: var(--fragment-input-height);
		height: var(--fragment-input-height);
		margin-right: calc(var(--padding));
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);

		border-radius: var(--fragment-input-border-radius);
		background-color: var(--fragment-input-background-color);
	}

	.checkbox:hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	.checkbox:focus-within {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
	}

	.input {
		width: 100%;
		height: 100%;
		border: none;
		border-radius: var(--fragment-input-border-radius);
		background-color: transparent;
		outline: 0;
	}

	.checked {
		position: absolute;
		left: 3px;
		top: 3px;
		bottom: 3px;
		right: 3px;

		border-radius: calc(var(--fragment-input-border-radius) * 0.5);
		background-color: var(--fragment-accent-color);

		opacity: 0;
		pointer-events: none;
	}

	.input:checked + .checked {
		opacity: 1;
	}

	.input:checked:disabled + .checked {
		background-color: var(--fragment-color-disabled);
	}
</style>
