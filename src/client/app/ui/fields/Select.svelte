<script>
	import { createEventDispatcher } from 'svelte';
	import SelectChevrons from '../SelectChevrons.svelte';

	export let options = [];
	export let name = '';
	export let value;
	export let disabled = false;
	export let title = '';
	export let context = null;
	export let key = '';

	let node;
	let sanitizedValue,
		sanitizedOptions = [];

	const dispatch = createEventDispatcher();

	function toStringifiedValue(option, optionType = typeof option) {
		if (option === null) {
			return `null`;
		} else if (option === undefined) {
			return `undefined`;
		} else if (optionType === 'object') {
			return toStringifiedValue(option.value);
		} else if (optionType === 'function') {
			return option.name;
		}

		return option.toString();
	}

	$: {
		sanitizedOptions = [];

		for (let i = 0; i < options.length; i++) {
			let option = options[i];
			let optionType = typeof option;
			let disabled =
				optionType === 'object' && typeof option.disabled === 'boolean'
					? option.disabled
					: false;
			let _value = optionType === 'object' ? option.value : option;

			let stringifiedValue = toStringifiedValue(option);
			let label;

			if (_value === value) {
				sanitizedValue = stringifiedValue;
			}

			if (option.label) {
				label = option.label;
			} else {
				label = stringifiedValue;
			}

			sanitizedOptions[i] = {
				label,
				value: stringifiedValue,
				disabled,
			};
		}
	}

	function handleChange(event) {
		const index = sanitizedOptions.findIndex(
			(opt) => opt.value === event.currentTarget.value,
		);
		const option = options[index];
		const newValue = typeof option === 'object' ? option.value : option;

		value = newValue;

		dispatch('change', newValue);
	}
</script>

<div
	class="select-input"
	class:disabled
	class:single={sanitizedOptions.length === 1}
>
	<div class="container">
		<select
			class="select"
			bind:this={node}
			on:change={handleChange}
			{name}
			{disabled}
			{title}
			bind:value={sanitizedValue}
		>
			{#each sanitizedOptions as option}
				<option
					value={option.value}
					selected={sanitizedValue === option.value}
					disabled={option.disabled}>{option.label}</option
				>
			{/each}
		</select>
		{#if sanitizedOptions.length > 1}
			<SelectChevrons />
		{/if}
	</div>
</div>

<style>
	.select-input {
		width: 100%;

		color: var(--color-text-input);
	}

	.select-input.disabled {
		color: var(--color-text-input-disabled);
	}

	.container {
		position: relative;

		display: flex;
		height: var(--height-input);
		margin: 2px 0;

		box-shadow: inset 0 0 0 1px var(--color-border-input);
		border-radius: var(--border-radius-input);
		background-color: var(--color-background-input);
	}

	.select-input:not(.disabled) .container:hover {
		box-shadow: inset 0 0 0 1px var(--color-active);
	}

	.container:focus-within {
		box-shadow: 0 0 0 2px var(--color-active);
	}

	.select {
		padding: 0 var(--padding, 6px) 0 var(--padding, 6px);

		width: 100%;

		color: inherit;
		font-size: var(--font-size-input);

		outline: 0;
		background-color: transparent;
		opacity: 1;
	}

	.select-input:not(.disabled) .select {
		cursor: pointer;
	}

	.select-input:not(.disabled) .select:focus {
		color: var(--color-text);
	}
</style>
