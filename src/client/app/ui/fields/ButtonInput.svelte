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

<div class="button-input" class:disabled>
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
	.button-input {
		display: flex;
		width: 100%;
	}

	.button {
		position: relative;

		display: flex;
		width: 100%;
		min-width: var(--fragment-input-height);
		height: var(--fragment-input-height);
		justify-content: center;
		align-items: center;
		padding: 0 4px;

		color: var(--text-color, var(--fragment-input-text-color));
		font-size: var(--fragment-input-font-size);

		border-radius: var(--fragment-input-border-radius);
		background-color: var(
			--background-color,
			var(--fragment-input-background-color)
		);
		box-shadow: inset 0 0 0 1px
			var(--box-shadow-color, var(--fragment-input-border-color));
		outline: 0;
	}

	.button:disabled {
		color: var(--fragment-input-disabled-text-color);
	}

	:global(body:not(.fragment-dragging)) .button:not(:disabled):hover {
		color: var(--text-color, var(--fragment-text-color));

		box-shadow: inset 0 0 0 1px
			var(--box-shadow-color-active, var(--fragment-accent-color));
	}

	:global(body:not(.fragment-dragging)) .button:not(:disabled):active,
	:global(body:not(.fragment-dragging)) .button:not(:disabled):focus-visible {
		box-shadow: 0 0 0 2px
			var(--box-shadow-color-active, var(--fragment-accent-color));
	}
</style>
