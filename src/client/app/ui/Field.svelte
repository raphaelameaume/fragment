<script context="module">
	import Select from './fields/Select.svelte';
	import NumberInput from './fields/NumberInput.svelte';
	import CheckboxInput from './fields/CheckboxInput.svelte';
	import VectorInput from './fields/VectorInput.svelte';
	import TextInput from './fields/TextInput.svelte';
	import TextareaInput from './fields/TextareaInput.svelte';
	import ColorInput from './fields/ColorInput.svelte';
	import ListInput from './fields/ListInput.svelte';
	import ButtonInput from './fields/ButtonInput.svelte';
	import ImageInput from './fields/ImageInput.svelte';
	import ImportInput from './fields/ImportInput.svelte';
	import IntervalInput from './fields/IntervalInput.svelte';
	import PaletteInput from './fields/PaletteInput.svelte';
	import GradientInput from './fields/GradientInput.svelte';
	import Link from './fields/Link.svelte';
	import RadioInput from './fields/RadioInput.svelte';
	import { fieldTypes } from '../utils/fields.utils.js';

	const fields = {
		[`${fieldTypes.SELECT}`]: Select,
		[`${fieldTypes.NUMBER}`]: NumberInput,
		[`${fieldTypes.VEC}`]: VectorInput,
		[`${fieldTypes.CHECKBOX}`]: CheckboxInput,
		[`${fieldTypes.TEXT}`]: TextInput,
		[`${fieldTypes.TEXTAREA}`]: TextareaInput,
		[`${fieldTypes.LIST}`]: ListInput,
		[`${fieldTypes.COLOR}`]: ColorInput,
		[`${fieldTypes.PALETTE}`]: PaletteInput,
		[`${fieldTypes.BUTTON}`]: ButtonInput,
		[`${fieldTypes.DOWNLOAD}`]: ButtonInput,
		[`${fieldTypes.IMPORT}`]: ImportInput,
		[`${fieldTypes.IMAGE}`]: ImageInput,
		[`${fieldTypes.INTERVAL}`]: IntervalInput,
		[`${fieldTypes.GRADIENT}`]: GradientInput,
		[`${fieldTypes.LINK}`]: Link,
		[`${fieldTypes.RADIO}`]: RadioInput,
		[`${fieldTypes.WRAPPER}`]: null,
	};
</script>

<script>
	/**
	 * @template T
	 */

	import FieldSection from './FieldSection.svelte';
	import FieldTriggers from './FieldTriggers.svelte';
	import { download } from '../utils/file.utils.js';
	import { map } from '../utils/math.utils';
	import frameDebounce from '../lib/helpers/frameDebounce.js';
	import { inferFieldType } from '../utils/fields.utils.js';
	import IconLocked from '../components/IconLocked.svelte';
	import IconTriggers from '../components/IconTriggers.svelte';
	import { deepEqual } from '../state/utils.svelte';

	/**
	 * @typedef {Object} FieldParams
	 * @property {boolean} [triggerable]
	 * @property {boolean} [controllable]
	 * @property {number} [min]
	 * @property {number} [max]
	 * @property {number} [step]
	 * @property {boolean} [locked]
	 * @property {Record<string, {value: unknown, label?: string} | unknown>} [options]
	 */

	/**
	 * @typedef {Object} Props
	 * @property {string} key
	 * @property {T} value
	 * @property {T} [initialValue]
	 * @property {string|null} [context]
	 * @property {FieldParams} [params]
	 * @property {string|null} [type]
	 * @property {boolean} [disabled]
	 * @property {string|undefined} [displayName]
	 * @property {number|null} [index]
	 * @property {(value: T) => void} [onchange]
	 * @property {(event: MouseEvent) => void} [onclick]
	 * @property {boolean} [trackChanges]
	 * @property {import('svelte').Snippet} [children]
	 * @property {import('../triggers/Trigger.js').Trigger[]} [triggers]
	 */

	/** @type {Props} */
	let {
		key,
		value,
		initialValue = value,
		context = null,
		params = $bindable({}),
		type = null,
		disabled = false,
		displayName = undefined,
		index = null,
		onchange = undefined,
		onclick = undefined,
		children = undefined,
		trackChanges = false,
		triggers = $bindable([]),
	} = $props();

	let showTriggers = $state(true);

	/** @type {Record<string, ((event?: any) => void) | undefined>} */
	const onTriggers = {
		checkbox: () => {
			value = /** @type {T} */ (/** @type {unknown} */ (!value));

			onchange?.(value);
		},
		/**
		 *
		 * @param {MouseEvent} event
		 */
		button: (event) => {
			/** @type {(event: MouseEvent) => void} */ (
				/** @type {unknown} */ (value)
			)(event);
			onclick?.(event);
		},
		/**
		 *
		 * @param {MouseEvent} event
		 */
		download: async (event) => {
			try {
				const fn =
					/** @type {(event: MouseEvent) => Promise<[any, string]>} */ (
						/** @type {unknown} */ (value)
					);
				const [data, filename] = await fn(event);

				download(data, filename);
			} catch (error) {
				console.error(`Error while trying to download:`, error);
			}
		},
		/**
		 * @param {{ value?: number }} [event]
		 */
		number: (event = {}) => {
			const { min, max } = params;
			const eventValue = event.value;
			const isValueInRange =
				eventValue !== undefined && eventValue >= 0 && eventValue <= 1;

			if (
				isValueInRange &&
				min !== undefined &&
				isFinite(min) &&
				max !== undefined &&
				isFinite(max)
			) {
				let v = map(eventValue, 0, 1, min, max);
				let step = params.step ? params.step : 1;
				const newValue = Math.round(v * (1 / step)) / (1 / step);

				onchange?.(
					/** @type {T} */ (/** @type {unknown} */ (newValue)),
				);
			}
		},
	};

	let fieldType = $derived(inferFieldType({ type, value, params, key }));
	let fieldProps = $derived(composeFieldProps(params, disabled));
	let onTrigger = $derived(
		frameDebounce(onTriggers[fieldType] ?? (() => {})),
	);
	let Component = $derived(
		/** @type {import('svelte').Component<any> | null} */ (
			fields[fieldType]
		),
	);
	let triggerable = $derived(
		params.triggerable !== false &&
			((fieldType === fieldTypes.NUMBER &&
				params.min !== undefined &&
				isFinite(params.min) &&
				params.max !== undefined &&
				isFinite(params.max)) ||
				fieldType === fieldTypes.BUTTON),
	);
	let triggersActive = $derived(triggers.length > 0);
	let changed = $derived(trackChanges && !deepEqual(value, initialValue));

	/**
	 *
	 * @param {MouseEvent} event
	 */
	function toggleTriggers(event) {
		event.preventDefault();

		showTriggers = !showTriggers;
	}

	/**
	 * @param {FieldParams} params
	 * @param {boolean} disabled
	 */
	function composeFieldProps(params, disabled) {
		const { triggerable, controllable, ...rest } = params;

		return {
			...rest,
			disabled,
			key,
			context,
		};
	}

	function restoreInitialValue() {
		onchange?.(/** @type {T} */ ($state.snapshot(initialValue)));
	}
</script>

<div
	class="field"
	class:disabled
	class:changed={!disabled && changed}
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
						<IconLocked locked={params.locked ?? false} />
					</button>
				{/if}
			</div>
		{/snippet}
		{#if Component}
			<Component {value} {...fieldProps} {onchange} onclick={onTrigger} />
		{/if}
		{@render children?.()}
	</FieldSection>
	{#if changed}
		<button
			class="field__changed"
			onclick={restoreInitialValue}
			title="Restore initial value"
		>
			<span class="visually-hidden">Restore initial value</span>
		</button>
	{/if}
	{#if triggerable && showTriggers}
		<FieldTriggers
			bind:triggers
			{onTrigger}
			triggerable={fieldType === fieldTypes.BUTTON}
			controllable={fieldType === fieldTypes.NUMBER}
		/>
	{/if}
</div>

<style>
	.field {
		--column-gap: 3px;
		--padding: 6px;

		position: relative;

		width: 100%;

		padding: 3px 6px 3px 12px;
		border-bottom: 1px solid var(--fragment-spacing-color);
	}

	.field__changed {
		position: absolute;
		top: 0px;
		left: 0px;
		bottom: 0px;
		z-index: 1;

		width: 13px;
		/* height: 4px; */
		/* border-radius: 2px; */

		background: transparent;
		cursor: pointer;

		&:before {
			content: '';

			position: absolute;
			top: 0;
			left: 0;

			display: block;
			width: 4px;
			height: 100%;

			--stripes-offset: calc(var(--index) * 1.9px);

			background: repeating-linear-gradient(
				45deg,
				var(--fragment-accent-color) calc(0px + var(--stripes-offset)),
				var(--fragment-accent-color) calc(2px + var(--stripes-offset)),
				transparent calc(2px + var(--stripes-offset)),
				transparent calc(4px + var(--stripes-offset))
			);
		}

		&:hover:before {
			width: 7px;
		}
	}

	.field:has(:global(.field-triggers)) .field__changed {
		max-height: calc(var(--fragment-input-height) + 4px + 6px);
	}

	:global(.field__input .field) {
		padding-left: 0px !important;
		padding-right: 0px !important;
	}

	:global(.field__input .field:last-child) {
		border-bottom-width: 0px !important;
		padding-bottom: 0px !important;
	}

	.field__actions {
		display: flex;
		align-items: center;
		gap: var(--column-gap);
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
		color: var(--fragment-text-color);

		opacity: 0.6;
		background-color: transparent;
		transition: opacity 0.1s ease;
	}

	.field__action--triggers :global(svg) {
		transform: rotate(90deg);
	}

	.field__action:hover {
		opacity: 1;
	}
</style>
