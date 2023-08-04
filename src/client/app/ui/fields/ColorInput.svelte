<script>
	import { createEventDispatcher } from 'svelte';
	import * as color from '../../utils/color.utils.js';
	import TextInput from './TextInput.svelte';
	import Field from '../Field.svelte';

	export let value;
	export let context = null;
	export let key = '';
	export let disabled = false;

	const dispatch = createEventDispatcher();

	$: format = color.getColorFormat(value);
	$: hexValue = color.toHex(value, format);
	$: textValue = color.toString(value, format);
	$: alpha = 1;
	$: hasAlpha = [
		color.FORMATS.RGBA_STRING,
		color.FORMATS.VEC4_STRING,
		color.FORMATS.VEC4_ARRAY,
		color.FORMATS.RGBA_OBJECT,
		color.FORMATS.HSLA_STRING,
	].includes(format);
	$: {
		if (hasAlpha) {
			const [r, g, b, a = 1] = color.toComponents(value);
			alpha = a;
		} else {
			alpha = 1;
		}
	}

	function dispatchChange() {
		const [r, g, b] = color.hexToComponents(hexValue);

		// support THREE.Color
		switch (format) {
			case color.FORMATS.VEC3_ARRAY:
				value[0] = r;
				value[1] = g;
				value[2] = b;
				dispatch('change', value);
				break;
			case color.FORMATS.VEC4_ARRAY:
				value[0] = r;
				value[1] = g;
				value[2] = b;
				value[3] = alpha;
				dispatch('change', value);
				break;
			case color.FORMATS.THREE:
			case color.FORMATS.RGB_OBJECT:
				value.r = r;
				value.g = g;
				value.b = b;

				dispatch('change', value);
				break;
			case color.FORMATS.RGBA_OBJECT:
				value.r = r;
				value.g = g;
				value.b = b;
				value.a = alpha;

				dispatch('change', value);
				break;
			default:
				dispatch('change', textValue);
		}
	}

	function handleBlur() {
		dispatchChange();
	}

	function onChangeText(event) {
		const newColor = event.detail;

		if (color.isColor(newColor)) {
			textValue = newColor;
		} else {
			// newColor is not a color, reset value
			textValue = color.toString(value, format);
		}

		hexValue = color.toHex(textValue);
		dispatchChange();
	}

	function onChangeAlpha(event) {
		alpha = event.detail;

		const [r, g, b] = color.hexToComponents(hexValue);

		switch (format) {
			case color.FORMATS.RGBA_STRING:
			case color.FORMATS.RGBA_OBJECT:
				textValue = color.componentsToRGBAString([r, g, b, alpha]);
				break;
			case color.FORMATS.VEC4_STRING:
				textValue = color.componentsToVec4String([r, g, b, alpha]);
				break;
			case color.FORMATS.HSLA_STRING:
				const [h, s, l] = color.hslToHSLComponents(textValue);
				textValue = color.hslaToHSLAString([h, s, l, alpha]);
				break;
		}

		dispatchChange();
	}

	function onInput(event) {
		hexValue = event.currentTarget.value;

		const [r, g, b] = color.hexToComponents(hexValue);

		switch (format) {
			case color.FORMATS.RGBA_STRING:
			case color.FORMATS.RGBA_OBJECT:
				textValue = color.toRGBAString({ r, g, b, a: alpha });
				break;
			case color.FORMATS.VEC3_STRING:
				textValue = color.componentsToVec3String([r, g, b]);
				break;
			case color.FORMATS.VEC4_STRING:
				textValue = color.componentsToVec4String([r, g, b, alpha]);
				break;
			case color.FORMATS.RGB_STRING:
			case color.FORMATS.RGB_OBJECT:
				textValue = color.toRGBString(hexValue);
				break;
			case color.FORMATS.HSL_STRING:
				textValue = color.componentsToHSLString([r, g, b]);
				break;
			case color.FORMATS.HSLA_STRING:
				textValue = color.componentsToHSLAString([r, g, b, alpha]);
				break;
			default:
				textValue = color.toString(hexValue);
				break;
		}

		dispatchChange();
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
			<!-- svelte-ignore -->
			<input
				class="input"
				type="color"
				disabled={disabled ? 'disabled' : null}
				bind:value={hexValue}
				on:blur={handleBlur}
				on:input={onInput}
			/>
		</div>
		<TextInput
			{context}
			{key}
			{disabled}
			bind:value={textValue}
			on:change={onChangeText}
		/>
	</div>
	{#if hasAlpha}
		<Field
			key={`${key}.alpha`}
			value={alpha}
			params={{ label: 'alpha', min: 0, max: 1, step: 0.01 }}
			{context}
			on:change={onChangeAlpha}
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
