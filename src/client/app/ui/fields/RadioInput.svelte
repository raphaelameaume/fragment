<script>
	import { isObject } from '../../state/utils.svelte';

	let {
		key,
		options,
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
	class="radio-input"
	class:disabled
	class:single={sanitizedOptions.length === 1}
	style="--fragment-radio-input-options-count: {sanitizedOptions.length}"
>
	<div class="container">
		{#each sanitizedOptions as sanitizedOption}
			{@const id = `${key}${sanitizedOption.value}`}
			<div class="radio-option">
				<input
					type="radio"
					{id}
					{name}
					{title}
					value={sanitizedOption.stringValue}
					checked={sanitizedValue === sanitizedOption}
					disabled={disabled || sanitizedOption.disabled}
					onchange={handleChange}
					class="input visually-hidden"
				/>
				<label
					class="label"
					class:disabled={sanitizedOption.disabled}
					for={id}><span>{sanitizedOption.label}</span></label
				>
			</div>
		{/each}
	</div>
</div>

<style>
	.radio-input {
		width: 100%;
		color: var(--fragment-input-text-color);
	}

	.radio-input.disabled {
		color: var(--fragment-input-disabled-text-color);
	}

	.container {
		position: relative;
		display: grid;
		grid-template-columns: repeat(
			var(--fragment-radio-input-options-count),
			minmax(0, 1fr)
		);
		grid-template-rows: 1fr;
		/*grid-template-columns: repeat(3, 1fr);*/
		min-height: var(--fragment-input-height);
		margin: 2px 0;

		background-color: var(--fragment-input-background-color);

		border-radius: var(--fragment-input-border-radius);
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);
	}

	.radio-option {
		min-width: 0;
		display: flex;

		&:not(:last-child) {
			border-right: 1px solid var(--fragment-input-border-color);
		}
	}

	.radio-input:not(.disabled) .radio-option {
		cursor: pointer;
	}

	.label {
		position: relative;
		z-index: 1;

		display: flex;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		padding: 0 6px;

		font-size: var(--fragment-input-font-size);

		border-radius: var(--fragment-input-border-radius);

		span {
			text-overflow: ellipsis;
			white-space: nowrap;
			user-select: none;
			overflow: hidden;
		}
	}

	.label:before {
		content: '';

		position: absolute;
		z-index: -1;
		left: 3px;
		top: 3px;
		bottom: 3px;
		right: 3px;

		border-radius: calc(var(--fragment-input-border-radius) * 0.5);
		background-color: var(--fragment-accent-color);

		opacity: 0;
		pointer-events: none;
	}

	.radio-input.disabled .label,
	.label.disabled {
		cursor: not-allowed;
		color: var(--fragment-input-disabled-text-color);
	}

	:global(body:not(.fragment-dragging))
		.radio-input:not(.disabled)
		.label:hover {
		color: var(--fragment-text-color);
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	/* checked: subtle tint, not a solid fill */
	.input:checked + .label {
		color: var(--fragment-text-color);

		&:before {
			opacity: 1;
		}
	}

	/* focus visible, checked or not */
	:global(body:not(.fragment-dragging))
		.radio-input:not(.disabled)
		.radio-option:has(.input:focus-visible)
		.label {
		box-shadow:
			0 0 0 2px var(--fragment-accent-color),
			inset 0 0 0 1px var(--fragment-input-background-color);
	}
</style>
