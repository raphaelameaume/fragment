<script>
	/**
	 * @typedef {Object} Props
	 * @property {boolean} value
	 * @property {boolean} disabled
	 * @property {(value: boolean) => void|undefined} onchange
	 */

	/** @type {Props} */
	let { value = $bindable(), disabled = false, onchange } = $props();

	function handleChange() {
		onchange?.(value);
	}
</script>

<div class="checkbox" class:disabled>
	<input
		class="input"
		bind:checked={value}
		type="checkbox"
		onchange={handleChange}
		{disabled}
	/>
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

	:global(body:not(.fragment-dragging)) .checkbox:not(.disabled):hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	:global(body:not(.fragment-dragging))
		.checkbox:not(.disabled):focus-within {
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

	.checkbox:after {
		content: '';

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

	.checkbox:has(.input:checked):after {
		opacity: 1;
	}

	.checkbox:has(.input:checked:disabled):after {
		background-color: var(--fragment-color-disabled);
	}
</style>
