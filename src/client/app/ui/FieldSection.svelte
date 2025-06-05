<script>
	let {
		key,
		visible = true,
		secondary,
		interactive,
		displayName = undefined,
		disabled = false,
		children,
		infos,
		onclick,
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

		background-color: var(--color-spacing);
	}

	.field__infos {
		position: relative;

		display: flex;
		align-items: center;
		justify-content: space-between;

		color: var(--color-text);
	}

	.field__label {
		color: inherit;
		font-size: var(--font-size-input);
		user-select: none;

		opacity: 0.6;
		background-color: transparent;
		transition: opacity 0.1s ease;
	}

	button.field__label {
		cursor: pointer;
	}

	.field__label:focus-visible {
		outline: 2px var(--color-active) solid;
		outline-offset: 2px;
		border-radius: 1px;
	}

	.field__section.secondary {
		grid-template-columns: 1fr;
	}

	.field__input {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;

		min-height: calc(var(--height-input) + 4px);
	}
</style>
