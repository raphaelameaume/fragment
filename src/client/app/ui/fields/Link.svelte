<script>
	let { value, label = value, disabled = false, target = null } = $props();
</script>

<div class="link-input" class:disabled>
	<a
		class="link"
		href={value}
		{target}
		tabindex={disabled ? -1 : null}
		aria-disabled={disabled ? true : null}
	>
		<span class="label">{label}</span>
	</a>
</div>

<style>
	.link-input {
		display: flex;
		width: 100%;

		&.disabled {
			pointer-events: none;
		}
	}

	.link {
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
		text-decoration: none;

		border-radius: var(--fragment-input-border-radius);
		background-color: var(
			--background-color,
			var(--fragment-input-background-color)
		);
		box-shadow: inset 0 0 0 1px
			var(--box-shadow-color, var(--fragment-input-border-color));
		outline: 0;
	}

	.link-input.disabled .link {
		color: var(--fragment-input-disabled-text-color);
	}

	:global(body:not(.fragment-dragging))
		.link-input:not(.disabled)
		.link:hover {
		color: var(--text-color, var(--fragment-text-color));

		box-shadow: inset 0 0 0 1px
			var(--box-shadow-color-active, var(--fragment-accent-color));
	}

	:global(body:not(.fragment-dragging))
		.link-input:not(.disabled)
		.link:active,
	:global(body:not(.fragment-dragging))
		.link-input:not(.disabled)
		.link:focus-visible {
		box-shadow: 0 0 0 2px
			var(--box-shadow-color-active, var(--fragment-accent-color));
	}
</style>
