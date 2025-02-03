<script>
	import SelectChevrons from '../SelectChevrons.svelte';

	let {
		options,
		name = '',
		value = $bindable(),
		disabled = false,
		title = '',
		onchange = () => {},
	} = $props();

	function toStringifiedValue(option, optionType = typeof option) {
		if (option === null) {
			return null;
		} else if (option === undefined) {
			return undefined;
		} else if (optionType === 'object') {
			return toStringifiedValue(option.value);
		} else if (optionType === 'function') {
			return option.name;
		}

		return option.toString();
	}

	let sanitizedOptions = $derived(
		options.map((option) => {
			let optionType = typeof option;
			let disabled =
				optionType === 'object' && typeof option.disabled === 'boolean'
					? option.disabled
					: false;
			let value = optionType === 'object' ? option.value : option;

			let stringValue = toStringifiedValue(option);

			let label = option.label ?? stringValue;

			return {
				label,
				value,
				stringValue,
				disabled,
			};
		}),
	);

	let sanitizedValue = $derived(
		sanitizedOptions.find((opt) => opt.value === value),
	);

	function handleChange(event) {
		const index = sanitizedOptions.findIndex(
			(opt) => opt.stringValue === event.currentTarget.value,
		);

		const option = options[index];
		const newValue = typeof option === 'object' ? option.value : option;

		onchange(newValue);
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
			onchange={handleChange}
			{name}
			{disabled}
			{title}
			value={sanitizedValue.stringValue}
		>
			{#each sanitizedOptions as option}
				<option
					value={option.stringValue}
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

	:global(body:not(.fragment-dragging))
		.select-input:not(.disabled)
		.container:hover {
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

	.select-input .select option {
		background-color: var(--color-background);
	}

	.select-input:not(.disabled) .select:focus {
		color: var(--color-text);
	}
</style>
