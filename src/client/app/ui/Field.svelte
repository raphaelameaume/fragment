<script context="module">
	import Select from './fields/Select.svelte';
	import NumberInput from './fields/NumberInput.svelte';
	import CheckboxInput from './fields/CheckboxInput.svelte';
	import VectorInput from './fields/VectorInput.svelte';
	import TextInput from './fields/TextInput.svelte';
	import ColorInput from './fields/ColorInput.svelte';
	import ListInput from './fields/ListInput.svelte';
	import ButtonInput from './fields/ButtonInput.svelte';
	import ImageInput from './fields/ImageInput.svelte';
	import IntervalInput from './fields/IntervalInput.svelte';
	import { fieldTypes, hasChanged } from '../utils/fields.utils.js';

	const fields = {
		[`${fieldTypes.SELECT}`]: Select,
		[`${fieldTypes.NUMBER}`]: NumberInput,
		[`${fieldTypes.VEC}`]: VectorInput,
		[`${fieldTypes.CHECKBOX}`]: CheckboxInput,
		[`${fieldTypes.TEXT}`]: TextInput,
		[`${fieldTypes.LIST}`]: ListInput,
		[`${fieldTypes.COLOR}`]: ColorInput,
		[`${fieldTypes.BUTTON}`]: ButtonInput,
		[`${fieldTypes.DOWNLOAD}`]: ButtonInput,
		[`${fieldTypes.IMPORT}`]: ImportInput,
		[`${fieldTypes.IMAGE}`]: ImageInput,
		[`${fieldTypes.INTERVAL}`]: IntervalInput,
	};
</script>

<script>
	import FieldSection from './FieldSection.svelte';
	import FieldTriggers from './FieldTriggers.svelte';
	import { download } from '../utils/file.utils.js';
	import { map } from '../utils/math.utils';
	import frameDebounce from '../lib/helpers/frameDebounce.js';
	import { inferFieldType } from '../utils/fields.utils.js';
	import IconTriggers from '../components/IconTriggers.svelte';
	import IconLocked from '../components/IconLocked.svelte';
	import ImportInput from './fields/ImportInput.svelte';

	let {
		key,
		value = null,
		initialValue = value,
		context = null,
		params = $bindable({}),
		type = null,
		disabled = false,
		displayName = undefined,
		index = null,
		onchange,
		onclick = () => {},
		children,
		triggers = [],
	} = $props();

	let showTriggers = $state(false);

	const onTriggers = {
		checkbox: () => {
			value = !value;

			onchange(value);
		},
		button: (event) => {
			value(event);
			onclick(event);
		},
		download: (event) => {
			let [data, filename] = value(event);

			download(data, filename);
		},
		number: (event = {}) => {
			const isValueInRange = event.value >= 0 && event.value <= 1;

			if (
				isValueInRange &&
				isFinite(params.min) &&
				isFinite(params.max)
			) {
				let v = map(event.value, 0, 1, params.min, params.max);
				let step = params.step ? params.step : 1;
				let value = Math.round(v * (1 / step)) / (1 / step);

				onchange(value);
			}
		},
	};

	let fieldType = $derived(inferFieldType({ type, value, params, key }));
	let fieldProps = $derived(composeFieldProps(params, disabled));
	let onTrigger = $derived(frameDebounce(onTriggers[fieldType]));
	let input = $derived(fields[fieldType]);
	let triggerable = $derived(
		params.triggerable !== false &&
			((fieldType === fieldTypes.NUMBER &&
				isFinite(params.min) &&
				isFinite(params.max)) ||
				fieldType === fieldTypes.BUTTON),
	);
	let triggersActive = $derived(triggers.length > 0);

	function toggleTriggers(event) {
		event.preventDefault();

		showTriggers = !showTriggers;
	}

	function composeFieldProps(params, disabled) {
		const { triggerable, controllable, ...rest } = params;

		return {
			...rest,
			disabled,
			key,
			context,
		};
	}
</script>

<div
	class="field"
	class:disabled
	class:changed={!disabled && hasChanged(initialValue, value)}
	style="--index: {index};"
>
	<FieldSection
		{key}
		{displayName}
		interactive={triggerable}
		onclick={toggleTriggers}
		{disabled}
	>
		{#snippet infos()}
			<div class="field__actions">
				{#if triggerable && !disabled}
					<button
						onclick={toggleTriggers}
						class="field__action field__action--triggers"
						class:active={triggersActive}
					>
						<IconTriggers />
					</button>
				{/if}
				{#if fieldType === fieldTypes.VEC && !disabled}
					<button
						class="field__action field__action--lock"
						onclick={() => (params.locked = !params.locked)}
					>
						<IconLocked locked={params.locked} />
					</button>
				{/if}
			</div>
		{/snippet}
		<svelte:component
			this={input}
			{value}
			{...fieldProps}
			{onchange}
			onclick={onTrigger}
		/>
		{@render children?.()}
	</FieldSection>
	{#if triggerable}
		<FieldSection {key} visible={showTriggers} secondary>
			<FieldTriggers
				{triggers}
				{onTrigger}
				{context}
				triggerable={fieldType === fieldTypes.BUTTON}
				controllable={fieldType === fieldTypes.NUMBER}
			/>
		</FieldSection>
	{/if}
</div>

<style>
	.field {
		--column-gap: 3px;
		--padding: 6px;

		position: relative;

		width: 100%;

		padding: 3px 6px 3px 12px;
		border-bottom: 1px solid var(--color-spacing);
	}

	.field.changed:before {
		content: '';

		position: absolute;
		top: 0px;
		left: 0px;
		bottom: 0px;
		z-index: 1;

		width: 4px;
		/* height: 4px; */
		/* border-radius: 2px; */

		--stripes-offset: calc(var(--index) * 1.9px);

		background: repeating-linear-gradient(
			45deg,
			var(--color-active) calc(0px + var(--stripes-offset)),
			var(--color-active) calc(2px + var(--stripes-offset)),
			transparent calc(2px + var(--stripes-offset)),
			transparent calc(4px + var(--stripes-offset))
		);
	}

	:global(.field__input .field) {
		padding-left: 0px !important;
		padding-right: 0px !important;
	}

	:global(.field__input .field:last-child) {
		border-bottom: 0px solid #323233 !important;
		padding-bottom: 0px !important;
	}

	.field.disabled {
		pointer-events: none;
	}

	.field__actions {
		display: flex;
		align-items: center;
	}

	.field__action {
		display: flex;
		align-items: center;

		background: transparent;
		transition: opacity 0.1s ease;
	}

	.field__action:hover {
		opacity: 1;
	}

	.field__action--triggers {
		--background-color: rgba(255, 255, 255, 0.5);

		position: relative;

		width: 16px;
		height: 16px;

		background-color: transparent;
		cursor: pointer;
	}

	.field__action--triggers:not(.active) {
		display: none;
	}

	.field__action {
		color: var(--color-text);

		opacity: 0.6;
		background-color: transparent;
		transition: opacity 0.1s ease;
	}

	.field__action--triggers svg {
		transform: rotate(90deg);
	}

	.field__action:hover {
		opacity: 1;
	}
</style>
