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
