<script>
	let {
		key,
		visible = true,
		secondary = false,
		interactive = false,
		displayName = undefined,
		disabled = false,
		children,
		infos = undefined,
		onclick = () => {},
	} = $props();
</script>

<div
	class="field__section"
	class:visible
	class:secondary
	class:disabled
	class:nameless={displayName === null}
>
	<div class="field__infos">
		{#if displayName !== null}
			{#if interactive}
				<button class="field__label" {disabled} {onclick}
					>{displayName ?? key}</button
				>
			{:else}
				<span class="field__label">{displayName ?? key}</span>
			{/if}
		{/if}
		{@render infos?.()}
	</div>
	<div class="field__input">
		{@render children?.()}
	</div>
</div>

<style>
	.field__section {
		position: relative;

		display: grid;
		grid-template-columns: 0.5fr 1fr;
		column-gap: 10px;
	}

	.field__section.nameless {
		grid-template-columns: 8px 1fr;
	}

	:global(body:not(.fragment-dragging))
		.field__section:not(.disabled):hover
		.field__label,
	.field__section:not(.disabled):focus-within .field__label {
		opacity: 1;
	}

	.field__section:not(.visible) {
		display: none;
	}

	.field__section.secondary {
		--margin: 15px;

		grid-template-columns: 0.25fr 1fr;
		margin-top: var(--margin);
	}

	.field__section.secondary:before {
		content: '';

		position: absolute;
		left: 10px;
		top: calc(var(--margin) * -1);

		width: 1px;
		height: var(--margin);

		background-color: var(--fragment-spacing-color);
	}

	.field__infos {
		position: relative;

		display: flex;
		align-items: center;
		justify-content: space-between;

		color: var(--fragment-text-color);
	}

	.field__label {
		color: inherit;
		font-size: var(--fragment-input-font-size);
		user-select: none;

		opacity: 0.6;
		background-color: transparent;
		transition: opacity 0.1s ease;
	}

	button.field__label:not(:disabled) {
		cursor: pointer;
	}

	.field__label:focus-visible {
		outline: 2px var(--fragment-accent-color) solid;
		outline-offset: 2px;
		border-radius: 1px;
	}

	.field__section.secondary {
		grid-template-columns: 1fr;
	}

	.field__section.secondary .field__label {
		position: relative;

		padding-left: 5px;

		background-color: var(--fragment-background-color);
	}

	.field__input {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;

		min-height: calc(var(--fragment-input-height) + 4px);
	}

	.field__section.secondary .field__input {
		padding: var(--column-gap);
		border: 1px solid var(--fragment-spacing-color);
	}
</style>
