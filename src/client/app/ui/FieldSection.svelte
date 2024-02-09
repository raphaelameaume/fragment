<script>
	export let key;
	export let visible = true;
	export let secondary = false;
	export let interactive = false;
	export let displayName = key;
	export let disabled = false;
</script>

<div
	class="field__section"
	class:visible
	class:secondary
	class:nameless={displayName === null}
>
	<div class="field__infos">
		{#if displayName !== null}
			{#if interactive}
				<button class="field__label" {disabled} on:click
					>{displayName}</button
				>
			{:else}
				<span class="field__label">{displayName}</span>
			{/if}
		{/if}
		<slot name="infos" />
	</div>
	<div class="field__input">
		<slot />
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
		grid-template-columns: 1fr;
	}

	.field__section:hover .field__label,
	.field__section:focus-within .field__label {
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
		outline: 0;
		box-shadow: 0 0 0 2px var(--color-text);
		border-radius: 2px;
	}

	.field__section.secondary {
		grid-template-columns: 1fr;
	}

	.field__section.secondary .field__infos {
		display: none;
	}

	.field__section.secondary .field__label {
		position: relative;

		padding-left: 5px;

		background-color: #242425;
	}

	.field__input {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;

		min-height: calc(var(--height-input) + 4px);
	}

	.field__section.secondary .field__input {
		padding: var(--column-gap);
		border: 1px solid var(--color-spacing);
	}
</style>
