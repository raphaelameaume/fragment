<script>
	import * as color from '../../utils/color.utils.js';
	import ButtonInput from './ButtonInput.svelte';
	import ColorInput from './ColorInput.svelte';

	let {
		value,
		context = null,
		key = '',
		disabled = false,
		onchange,
		editable = true,
		extensible = true,
	} = $props();

	let selected = $state(-1);

	let hexValues = $derived.by(() => {
		return value.map((v) => {
			const format = color.getColorFormat(v);
			return color.toHex(v, format);
		});
	});

	$effect(() => {
		// handle value length changes when a color is selected
		if (selected >= hexValues.length) {
			selected = hexValues.length - 1;
		}
	});

	/**
	 *
	 * @param {PointerEvent} event
	 * @param {number} index
	 */
	function handleClick(event, index) {
		if (selected !== index) {
			selected = index;
		} else {
			selected = -1;
			event.currentTarget.blur();
		}
	}

	/**
	 *
	 * @param {string} color
	 */
	function handleColorChange(color) {
		let palette = value.map((v) => v);
		palette[selected] = color;

		onchange(palette);
	}

	function handleClickAdd() {
		let palette = value.map((v) => v);
		palette.push('#ffffff');

		onchange(palette);
		selected = -1;
	}

	function handleClickDelete() {
		let index = selected;
		let palette = value.map((v) => v);
		palette.splice(index, 1);

		onchange(palette);
		selected = -1;
	}
</script>

<div class="palette-input" class:disabled style="--count: {hexValues.length}">
	<div class="palette-list">
		{#if editable && extensible}
			<div class="palette-action">
				<ButtonInput label="+" onclick={handleClickAdd} />
			</div>
		{/if}
		{#each hexValues as hexValue, index}
			{#if editable}
				<button
					class="palette-action"
					style="--current-color: {hexValue}"
					class:selected={selected === index}
					onclick={(event) => handleClick(event, index)}
				>
					<span class="visually-hidden">Change color {index}</span>
				</button>
			{:else}
				<div
					class="palette-action"
					style="--current-color: {hexValue}"
				></div>
			{/if}
		{/each}
	</div>
	{#if value[selected]}
		<div class="palette-editor">
			<ColorInput value={value[selected]} onchange={handleColorChange} />
		</div>
		{#if editable && extensible}
			<div class="palette-delete">
				<ButtonInput label="delete" onclick={handleClickDelete} />
			</div>
		{/if}
	{/if}
</div>

<style>
	.palette-input {
		position: relative;
		width: 100%;

		display: flex;
		flex-direction: column;
		row-gap: var(--column-gap);
	}

	.palette-list {
		display: flex;
		flex-wrap: wrap;

		column-gap: var(--column-gap);
		row-gap: var(--column-gap);
		align-items: center;
	}

	.palette-action {
		position: relative;
		aspect-ratio: 1;
		height: var(--fragment-input-height);

		border-radius: var(--fragment-input-border-radius);
		background-color: var(
			--background-color,
			var(--fragment-input-background-color)
		);
		box-shadow: inset 0 0 0 1px
			var(--box-shadow-color, var(--fragment-input-border-color));
		outline: 0;
	}

	button.palette-action {
		cursor: pointer;
	}

	.palette-input:focus-within .palette-action.selected {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
	}

	.palette-action:before {
		--gap: 1px;
		content: '';

		position: absolute;
		z-index: 1;
		top: var(--gap);
		left: var(--gap);
		right: var(--gap);
		bottom: var(--gap);

		background-color: var(--current-color);
		border-radius: calc(var(--fragment-input-border-radius) - var(--gap));
		opacity: var(--opacity, 1);
		pointer-events: none;
	}

	:global(body:not(.fragment-dragging))
		button.palette-action:not(.disabled):hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	:global(body:not(.fragment-dragging))
		button.palette-action:not(.disabled):focus-within {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
	}
</style>
