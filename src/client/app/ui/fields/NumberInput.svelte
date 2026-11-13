<script>
	import { tick } from 'svelte';
	import FieldInputRow from './FieldInputRow.svelte';
	import Input from './Input.svelte';
	import ProgressInput from './ProgressInput.svelte';
	import Keyboard from '../../inputs/Keyboard.js';
	import { clamp, roundToStep } from '../../utils/math.utils.js';

	let {
		value = null,
		label = '',
		step = 1,
		suffix = '',
		min = -Infinity,
		max = Infinity,
		disabled = false,
		context = null,
		key = '',
		progress = true,
		onchange,
		onfocus,
		onblur,
		node = $bindable(),
	} = $props();

	let hasProgress = $derived(progress && isFinite(min) && isFinite(max));
	let isFocused = $state(false);
	let precision = $derived(step.toString().split('.')[1]?.length || 0);

	/**
	 * @param {string} v
	 * @param {string} suffix
	 */
	function sanitize(v, suffix) {
		return suffix && suffix !== '' ? Number(v.split(suffix)[0]) : Number(v);
	}

	/**
	 *
	 * @param {number} v
	 * @param {boolean} isFocused
	 * @param {string} suffix
	 * @param {number} precision
	 */
	function composeValue(v, isFocused, suffix = '', precision) {
		const clampedValue = clamp(
			v,
			isFinite(min) ? min : -Infinity,
			isFinite(max) ? max : Infinity,
		);
		const roundedValue =
			typeof step === 'number' ? roundToStep(clampedValue, step) : v;

		const fixedValue = roundedValue.toFixed(precision);

		return isFocused ? `${fixedValue}` : `${fixedValue}${suffix}`;
	}

	let composedValue = $derived.by(() =>
		composeValue(value, isFocused, suffix, precision),
	);

	/**
	 * @param {FocusEvent} event
	 */
	function onFocus(event) {
		isFocused = true;
		onfocus?.(event);
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	async function onBlur(event) {
		let currentTarget = event.currentTarget;

		await tick();

		if (currentTarget instanceof HTMLInputElement) {
			let newValue = currentTarget.value;
			isFocused = false;
			let sanitizedValue = sanitize(newValue, suffix);

			if (isNaN(sanitizedValue)) {
				onchange(value, true);
			} else {
				onchange(sanitizedValue, true);
			}

			onblur?.(event);
		}
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function onKeyDown(event) {
		if (
			event.currentTarget instanceof HTMLInputElement &&
			['ArrowDown', 'ArrowUp'].includes(event.key)
		) {
			event.preventDefault();

			const diff = Keyboard.getStepFromEvent(event) * step;
			const direction = event.key === 'ArrowUp' ? 1 : -1;
			const sanitizedValue =
				sanitize(event.currentTarget.value, suffix) + direction * diff;

			onchange(sanitizedValue, false);
		}
	}
</script>

<div class="number-input {hasProgress ? 'number-input--with-progress' : ''}">
	{#if hasProgress}
		<FieldInputRow --grid-template-columns="1fr 0.5fr">
			<ProgressInput
				{step}
				{value}
				{min}
				{max}
				{context}
				{disabled}
				{key}
				{onchange}
			/>
			<Input
				{label}
				{disabled}
				{context}
				{key}
				bind:node
				onkeydown={onKeyDown}
				onfocus={onFocus}
				onblur={onBlur}
				value={composedValue}
			/>
		</FieldInputRow>
	{:else}
		<Input
			{label}
			{disabled}
			{context}
			{key}
			onkeydown={onKeyDown}
			onfocus={onFocus}
			onblur={onBlur}
			bind:node
			value={composedValue}
		/>
	{/if}
</div>

<style>
	.number-input {
		position: relative;
		width: 100%;
	}
</style>
