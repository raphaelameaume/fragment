<script>
	let {
		label = 'run',
		disabled = false,
		showLabel = true,
		title = '',
		onclick,
		onmouseenter,
		onmouseleave,
		children,
	} = $props();
</script>

<div class="button-container" class:disabled>
	<button
		class="button"
		{disabled}
		{onclick}
		{onmouseenter}
		{onmouseleave}
		{title}
	>
		<span class="label" class:visually-hidden={!showLabel}>{label}</span>
		{@render children?.()}
	</button>
</div>

<style>
	.button-container {
		display: flex;
		width: 100%;
	}

	.button {
		display: flex;
		width: 100%;
		min-width: var(--height-input);
		height: var(--height-input);
		justify-content: center;
		align-items: center;
		padding: 0 4px;

		color: var(--color-text-input);
		font-size: var(--font-size-input);

		border-radius: var(--border-radius-input);
		background-color: var(
			--background-color,
			var(--color-background-input)
		);
		box-shadow: inset 0 0 0 1px
			var(--box-shadow-color, var(--color-border-input));
		outline: 0;
	}

	.button:disabled {
		color: var(--color-text-input-disabled);
	}

	:global(body:not(.fragment-dragging)) .button:hover {
		color: var(--color-text);

		box-shadow: inset 0 0 0 1px
			var(--box-shadow-color-active, var(--color-active));
	}

	.button:active,
	.button:focus-visible {
		box-shadow: 0 0 0 2px
			var(--box-shadow-color-active, var(--color-active));
	}
</style>
