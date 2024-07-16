<script>
	import * as color from '../../utils/color.utils.js';
	import TextInput from './TextInput.svelte';
	import Field from '../Field.svelte';

	let { value, context = null, key = '', disabled = false, onchange } = $props();

	let format = $derived(color.getColorFormat(value));
	let hexValue = $derived(color.toHex(value, format));
	let textValue = $state();
	let alpha = $state(1);
	let hasAlpha = $derived([
		color.FORMATS.RGBA_STRING,
		color.FORMATS.VEC4_STRING,
		color.FORMATS.VEC4_ARRAY,
		color.FORMATS.RGBA_OBJECT,
		color.FORMATS.HSLA_STRING,
	].includes(format));

	$effect(() => {
		if (hasAlpha) {
			const [r, g, b, a = 1] = color.toComponents(value);
			alpha = a;
		} else {
			alpha = 1;
		}
	})

	$effect(() => {
		textValue = color.toString(value, format)?.toLowerCase();
	});

	function dispatchChange(newColor) {
		const newFormat = color.getColorFormat(newColor);

		if (format === newFormat) {
			onchange(newColor);
		} else {
			const components = color.toComponents(newColor); 
			const [r, g, b] = components;

			switch(format) {
				case color.FORMATS.THREE:
				case color.FORMATS.RGB_OBJECT:
					value.r = r;
					value.g = g;
					value.b = b;

					onchange(value);
					break;
				case color.FORMATS.RGBA_OBJECT:
					value.r = r;
					value.g = g;
					value.b = b;
					value.a = alpha;

					onchange(value);
					break;
				default:
					onchange(color.componentsToFormat([r, g, b, alpha], format));
			}

			if (format === color.FORMATS.THREE) {
				// force recompute of hex
				textValue = color.toString(value, format)?.toLowerCase();
			}
		}
	}

	function handleBlur(event) {
		dispatchChange(event.currentTarget.value);
	}

	function onChangeText(event) {
		dispatchChange(event.currentTarget.value);
	}

	function onChangeAlpha(newAlpha) {
		alpha = newAlpha;

		dispatchChange(color.toHex(value));
	}

	function onInput(event) {
		dispatchChange(event.currentTarget.value);
	}
</script>

<div class="color-input" class:disabled>
	<div class="layout">
		<div
			class="mirror"
			style="--currentColor: {hexValue}; --opacity: {alpha}"
		>
			{#if hasAlpha}
				<svg
					width="calc(100% - 2px)"
					height="calc(100% - 2px)"
					class="alpha-svg"
				>
					<pattern
						id="checker"
						x="0"
						y="0"
						width="7.2"
						height="7.2"
						patternUnits="userSpaceOnUse"
					>
						<rect
							fill="white"
							x="0"
							width="3.6"
							height="3.6"
							y="0"
						/>
						<rect
							fill="grey"
							x="3.6"
							width="3.6"
							height="3.6"
							y="0"
						/>
						<rect
							fill="white"
							x="3.6"
							width="3.6"
							height="3.6"
							y="3.6"
						/>
						<rect
							fill="grey"
							x="0"
							width="3.6"
							height="3.6"
							y="3.6"
						/>
					</pattern>
					<!-- The canvas with our applied pattern -->
					<rect
						x="0"
						y="0"
						width="100%"
						height="100%"
						fill="url(#checker)"
					/>
				</svg>
			{/if}
			<input
				class="input"
				type="color"
				disabled={disabled ? 'disabled' : null}
				value={hexValue}
				onblur={handleBlur}
				oninput={onInput}
			/>
		</div>
		<TextInput
			{context}
			{key}
			{disabled}
			value={textValue}
			onchange={onChangeText}
		/>
	</div>
	{#if hasAlpha}
		<Field
			key="alpha"
			value={alpha}
			params={{ min: 0, max: 1, step: 0.01 }}
			{context}
			onchange={onChangeAlpha}
		/>
	{/if}
</div>

<style>
	.color-input {
		position: relative;
		width: 100%;
	}

	.layout {
		display: grid;
		column-gap: var(--column-gap);
		grid-template-columns: 0.35fr 0.65fr;
		align-items: center;
	}

	.alpha-svg {
		position: absolute;
		top: 1px;
		left: 1px;
		right: 1px;
		bottom: 1px;

		border-radius: calc(var(--border-radius-input) * 0.5);
	}

	.mirror {
		position: relative;

		height: var(--height-input);

		border-radius: var(--border-radius-input);
		box-shadow: inset 0 0 0 1px var(--color-border-input);
	}

	.mirror:after {
		--gap: 1px;

		content: '';
		position: absolute;
		z-index: 1;
		top: var(--gap);
		left: var(--gap);
		right: var(--gap);
		bottom: var(--gap);

		background-color: var(--currentColor);
		border-radius: calc(var(--border-radius-input) * 0.5);
		opacity: var(--opacity, 1);
		pointer-events: none;
	}

	.mirror:hover {
		box-shadow: inset 0 0 0 1px var(--box-shadow-color, var(--color-active));
	}

	.mirror:focus-within {
		box-shadow: 0 0 0 2px var(--box-shadow-color, var(--color-active));
	}

	.input {
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
		background: transparent;
		border: none;
	}
</style>
