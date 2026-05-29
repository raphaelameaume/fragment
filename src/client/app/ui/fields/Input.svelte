<script>
	let {
		label,
		value = $bindable(),
		disabled = false,
		oninput,
		onchange,
		onkeydown,
		onfocus,
		onblur,
		node = $bindable(),
	} = $props();

	/**
	 * @param {KeyboardEvent} event
	 */
	function onKeyPress(event) {
		if (
			event.currentTarget instanceof HTMLInputElement &&
			event.key === 'Enter'
		) {
			event.currentTarget.blur();
		}
	}
</script>

<div class="input-container" class:disabled>
	{#if label !== undefined}
		<span class="label">{label}</span>
	{/if}
	<input
		class="input"
		bind:this={node}
		bind:value
		{oninput}
		{onchange}
		{onkeydown}
		{onfocus}
		{onblur}
		onkeypress={onKeyPress}
		{disabled}
		autocomplete="off"
		spellcheck="false"
	/>
</div>

<style>
	.input-container {
		position: relative;

		display: flex;
		height: var(--fragment-input-height);
		margin: 2px 0;

		border-radius: var(--fragment-input-border-radius);
		background-color: var(--fragment-input-background-color);
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);
	}

	:global(body:not(.fragment-dragging))
		.input-container:not(.disabled):hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	:global(body:not(.fragment-dragging))
		.input-container:not(.disabled):focus-within {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
	}

	.label {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;

		display: flex;
		align-items: center;
		padding: var(--padding);

		color: var(--fragment-text-color);
		font-size: var(--fragment-input-font-size);
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

		color: var(--fragment-input-text-color);
		font-size: var(--fragment-input-font-size);
		text-align: right;

		background: transparent;
		outline: 0;
	}

	.input:disabled {
		color: var(--fragment-input-disabled-text-color);
	}

	.input:focus {
		color: var(--fragment-text-color);
	}

	/* .input:focus {
    border: var(--borderWidth) solid var(--fragment-accent-color);
} */
</style>
