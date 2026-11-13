<script>
	let {
		value = $bindable(),
		height,
		disabled = false,
		oninput,
		onchange,
		onkeydown,
		onfocus,
		onblur,
	} = $props();

	/**
	 * @param {KeyboardEvent} event
	 */
	function onKeyPress(event) {
		if (
			event.currentTarget instanceof HTMLTextAreaElement &&
			event.key === 'Enter' &&
			!event.shiftKey
		) {
			event.currentTarget.blur();
		}
	}
</script>

<div
	class="input-container"
	class:disabled
	style={height ? `--height: ${height}` : null}
>
	<textarea
		class="input"
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
	></textarea>
</div>

<style>
	.input-container {
		position: relative;

		display: flex;
		width: 100%;
		height: var(--height, var(--fragment-input-height));
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

	.input {
		width: 100%;
		height: 100%;
		padding: var(--padding) var(--padding);

		color: var(--fragment-input-text-color);
		font-size: var(--fragment-input-font-size);
		text-align: left;

		background: transparent;
		outline: 0;
		resize: none;
		border: none;
	}

	.input:disabled {
		color: var(--fragment-input-disabled-text-color);
	}

	.input:focus {
		color: var(--fragment-text-color);
	}
</style>
