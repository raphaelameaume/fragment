<script>
	import { isObject } from '../../state/utils.svelte';
	import SelectChevrons from '../SelectChevrons.svelte';

	let {
		options,
		name = '',
		value = $bindable(),
		disabled = false,
		title = '',
		onchange = () => {},
	} = $props();

	function toStringifiedValue(value) {
		if (typeof value === 'function') {
			return `${value.name}()`;
		}

		return String(value);
	}

	function createOption(option) {
		let value =
			isObject(option) && 'value' in option ? option.value : option;
		let label = option?.label ?? toStringifiedValue(value);
		let disabled = option?.disabled ?? false;
		let stringValue = toStringifiedValue(value);

		return {
			label,
			value,
			stringValue,
			disabled,
		};
	}

	let sanitizedOptions = $derived.by(() => {
		let opts = options.map((option, optionIndex) => {
			return createOption(option, optionIndex);
		});

		return opts;
	});

	let sanitizedValue = $derived(
		sanitizedOptions.find((opt) => opt.value === value) ??
			sanitizedOptions[0],
	);

	function handleChange(event) {
		const sanitizedOption = sanitizedOptions.find(
			(opt) => opt.stringValue === event.currentTarget.value,
		);

		onchange(sanitizedOption.value);
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
		<SelectChevrons />
	</div>
</div>

<style>
	.select-input {
		width: 100%;

		color: var(--fragment-input-text-color);
	}

	.select-input.disabled {
		color: var(--fragment-input-disabled-text-color);
	}

	.container {
		position: relative;

		display: flex;
		height: var(--fragment-input-height);
		margin: 2px 0;

		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);
		border-radius: var(--fragment-input-border-radius);
		background-color: var(--fragment-input-background-color);
	}

	:global(body:not(.fragment-dragging))
		.select-input:not(.disabled)
		.container:hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	.container:focus-within {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
	}

	.select {
		padding: 0 var(--padding, 6px) 0 var(--padding, 6px);

		width: 100%;

		color: inherit;
		font-size: var(--fragment-input-font-size);

		outline: 0;
		background-color: transparent;
		opacity: 1;
	}

	.select-input:not(.disabled) .select {
		cursor: pointer;
	}

	.select-input .select option {
		background-color: var(--fragment-background-color);
	}

	.select-input:not(.disabled) .select:focus {
		color: var(--fragment-text-color);
	}
</style>
