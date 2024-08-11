<script>
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
	} = $props();

	let hasProgress = $derived(progress && isFinite(min) && isFinite(max));
	let isFocused = $state(false);
	let precision = $derived(step.toString().split('.')[1]?.length || 0);

	function sanitize(v, suffix) {
		return suffix && suffix !== '' ? Number(v.split(suffix)[0]) : Number(v);
	}

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

	function onFocus() {
		isFocused = true;
	}

	function onBlur(event) {
		isFocused = false;

		let newValue = event.currentTarget.value;
		let isNotValid = isNaN(Number(event.currentTarget.value));

		if (isNotValid) {
			newValue = `${value}`;
		}

		onchange(sanitize(newValue, suffix));
	}

	function onKeyDown(event) {
		if ([38, 40].includes(event.keyCode)) {
			event.preventDefault();

			const diff = Keyboard.getStepFromEvent(event) * step;
			const direction = event.keyCode === 38 ? 1 : -1;
			const newValue = sanitize(composedValue, suffix) + direction * diff;

			onchange(newValue);
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
