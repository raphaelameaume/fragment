<script>
import { createEventDispatcher } from "svelte";

import Select from "./fields/Select.svelte";
import NumberInput from "./fields/NumberInput.svelte";
import CheckboxInput from "./fields/CheckboxInput.svelte";
import VectorInput from "./fields/VectorInput.svelte";
import TextInput from "./fields/TextInput.svelte";
import ColorInput from "./fields/ColorInput.svelte";
import ListInput from "./fields/ListInput.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";
import ImageInput from "./fields/ImageInput.svelte";
import FieldSection from "./FieldSection.svelte";
import FieldTriggers from "./FieldTriggers.svelte";
import { inferFromParams, inferFromValue } from "../utils/props.utils.js";
import { download } from "../utils/file.utils.js";
import { map } from "../utils/math.utils";
import frameDebounce from "../lib/helpers/frameDebounce.js";
import { getStore } from "../stores/utils";
import { writable } from "svelte/store";

export let key = '';
export let value = null;
export let context = null;
export let params = {};
export let type = null;

let offsetWidth;
let showTriggers = false;

const store = getStore(context, { props: {}}, {
    persist: context !== null,
});

if (!$store.props[key]) {
    $store.props[key] = { triggers: [] };
}

let triggers = writable($store.props[key].triggers.filter((trigger) => trigger.inputType !== undefined));
triggers.subscribe((all) => {
    store.update((curr) => {
        curr.props[key].triggers = all;

        return curr;
    });
})

const dispatch = createEventDispatcher();
const fields = {
    "select": Select,
    "number": NumberInput,
    "vec": VectorInput,
    "checkbox": CheckboxInput,
    "text": TextInput,
    "list": ListInput,
    "color": ColorInput,
    "button": ButtonInput,
    "download": ButtonInput,
    "image": ImageInput,
};

const onTriggers = {
    'checkbox': () => {
        value = !value;

        dispatch('change', value);
    },
    'button': (event) => {
        value(event);
        dispatch('click', event);
    },
    'download': (event) => {
        let [data, filename] = value(event);

        download(data, filename);
    },
    'number': (event = {}) => {
        const isValueInRange = event.value >= 0 && event.value <= 1;

        if (isValueInRange && isFinite(params.min) && isFinite(params.max)) {
            let v = map(event.value, 0, 1, params.min, params.max);
            let step = params.step ? params.step : 1;
            let value = Math.round(v * (1 / step)) / (1 / step);

            dispatch('change', value);
        }
    },
};

$: fieldType = type ? type : (inferFromParams(params) || inferFromValue(value));
$: fieldProps = composeFieldProps(params);
$: onTrigger = frameDebounce(onTriggers[fieldType]);
$: input = fields[fieldType];
$: label = params.label !== undefined && typeof value !== "function" ? params.label : key;
$: disabled = params.disabled;
$: triggerable = params.triggerable !== false && (
    (fieldType === "number" && isFinite(params.min) && isFinite(params.max)) ||
    (fieldType === "button")
);
$: {
    if (fieldType === "download" || fieldType === "button") {
        if (params.label === undefined) {
            fieldProps.label = fieldType === "download" ? "download" : "run";
        }
    }
}
$: xxsmall = offsetWidth < 200;
$: xsmall = !xxsmall && offsetWidth < 260;
$: small = !xxsmall && !xsmall && offsetWidth < 320;
$: triggersActive = $triggers.length > 0;

function toggleTriggers(event) {
    event.preventDefault();

    showTriggers = !showTriggers;
}

function composeFieldProps(params) {
    const { triggerable, controllable, ...rest } = params;

    return rest;
}

</script>

<div class="field"
    class:disabled={disabled}
    class:xxsmall={xxsmall}
    class:xsmall={xsmall}
    class:small={small}
    bind:offsetWidth={offsetWidth}
>
    <FieldSection name={key} label={label} interactive={triggerable} on:click={toggleTriggers}>
        <div slot="infos" class="field__actions">
            {#if triggerable && !disabled }
                <button
                    on:click={toggleTriggers}
                    class="field__action field__action--triggers"
                    class:active={triggersActive}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 8H7.25"/>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12.75 8H19.25"/>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 16H12.25"/>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.75 16H19.25"/>
                        <circle cx="10" cy="8" r="2.25" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                        <circle cx="15" cy="16" r="2.25" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                    </svg>
                </button>
            {/if}
            {#if (fieldType === "vec") && !disabled }
                <button class="field__action field__action--lock" on:click={() => params.locked = !params.locked}>
                    {#if params.locked}
                    <svg class="action__icon" width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.75 11.75C5.75 11.1977 6.19772 10.75 6.75 10.75H17.25C17.8023 10.75 18.25 11.1977 18.25 11.75V17.25C18.25 18.3546 17.3546 19.25 16.25 19.25H7.75C6.64543 19.25 5.75 18.3546 5.75 17.25V11.75Z"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.75 10.5V10.3427C7.75 8.78147 7.65607 7.04125 8.74646 5.9239C9.36829 5.2867 10.3745 4.75 12 4.75C13.6255 4.75 14.6317 5.2867 15.2535 5.9239C16.3439 7.04125 16.25 8.78147 16.25 10.3427V10.5"></path>
                    </svg>
                    {:else}
                    <svg class="action__icon" width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.75 11.75C5.75 11.1977 6.19772 10.75 6.75 10.75H17.25C17.8023 10.75 18.25 11.1977 18.25 11.75V17.25C18.25 18.3546 17.3546 19.25 16.25 19.25H7.75C6.64543 19.25 5.75 18.3546 5.75 17.25V11.75Z"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.75 10.5V9.84343C7.75 8.61493 7.70093 7.29883 8.42416 6.30578C8.99862 5.51699 10.0568 4.75 12 4.75C14 4.75 15.25 6.25 15.25 6.25"></path>
                    </svg>
                    {/if}
                </button>
            {/if}
        </div>
        <svelte:component
            this={input}
            {value}
            {...fieldProps}
            on:change
            on:click={onTrigger}
        />
        <slot></slot>
    </FieldSection>
    {#if triggerable }
        <FieldSection visible={showTriggers} secondary>
            <FieldTriggers
                {triggers}
                {onTrigger}
                {context}
                triggerable={fieldType === "button"}
                controllable={fieldType === "number"}
            />
        </FieldSection>
    {/if}
</div>

<style>
.field {
    --column-gap: 3px;
    --padding: 6px;

    width: 100%;

    padding: 3px 6px 3px 12px;
    border-bottom: 1px solid var(--color-spacing);
}

:global(.field__input .field) {
    padding-left: 0px !important;
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
