<script>
import { createEventDispatcher } from "svelte";
import { colord } from "colord";

import Select from "./fields/Select.svelte";
import NumberInput from "./fields/NumberInput.svelte";
import CheckboxInput from "./fields/CheckboxInput.svelte";
import Vec2Input from "./fields/Vec2Input.svelte";
import Vec3Input from "./fields/Vec3Input.svelte";
import TextInput from "./fields/TextInput.svelte";
import ColorInput from "./fields/ColorInput.svelte";
import ListInput from "./fields/ListInput.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";
import FieldSection from "./FieldSection.svelte";
import FieldTriggers from "./FieldTriggers.svelte";
import * as triggersMap from "../triggers/index.js";

export let sketch = null;
export let key = '';
export let value = sketch && sketch.props[key] ? sketch.props[key].value : null;
export let params = {};
export let context = null;
export let type = inferFromParams() || inferFromValue();
// export let triggers = [];


const fields = {
    "select": Select,
    "number": NumberInput,
    "vec2": Vec2Input,
    "vec3": Vec3Input,
    "checkbox": CheckboxInput,
    "text": TextInput,
    "list": ListInput,
    "color": ColorInput,
    "button": ButtonInput,
};

function inferFromParams() {
    if (params.options && Array.isArray(params.options)) {
        return "select";
    }

    return null;
}

function inferFromValue() {
    if (typeof value === "number") {
        return "number";
    } else if (typeof value === "function") {
        return "button";
    } else if (typeof value === "boolean") {
        return "checkbox";
    } else if (typeof value === "string") {
        if (colord(value).parsed) return "color";
        return "text";
    } else if (Array.isArray(value) && value.length === 2) {
        return "vec2";
    } else if (Array.isArray(value) && value.length === 3) {
        return "vec3";
    } else if (typeof value === "object" && Object.keys(value).length === 3) {
        return "vec3";
    } else if (typeof value === "object" && Object.keys(value).length === 2) {
        return "vec2";
    }
}

let input = fields[type];
let isTriggerable = ["button", "checkbox"].includes(type);

let offsetWidth;
let secondaryVisible = true;

let sizes = [
    ["small", 320],
    ["xsmall", 260],
    ["xxsmall", 200],
];

let sizeClassName = "";

$: {
    for (let i = 0; i < sizes.length; i++) {
        const [name, size] = sizes[i];

        if (offsetWidth < size) {
            sizeClassName = name;
        } 
    }
}

function handleChange(event) {
    sketch.props[key].value = event.detail;
}

function handleTriggersChange(event) {
    const { triggers: currentTriggers = [] } = sketch.props[key];

    if (currentTriggers.length) {
        currentTriggers
            .filter(trigger => trigger !== null)
            .forEach((trigger) => trigger.destroy());
    }

    const newTriggers = event.detail
        .map(({ eventName, params }) => {
            const trigger = triggersMap[eventName];

            console.log(eventName, params);

            if (trigger) {
                const onTrigger = type === 'checkbox' ? () => {
                    value = !value;
                } : () => {
                    value();
                };
                
                return trigger(onTrigger, { context, ...params });
            } else {
                return null;
            }
        });

    console.log(newTriggers);

    sketch.props[key].triggers = newTriggers;
}

</script>

<div class="field {sizeClassName} {params.disabled ? "disabled": ""}" bind:offsetWidth={offsetWidth}>
    <FieldSection name={key} label={key} onClickLabel={() => secondaryVisible = !secondaryVisible}>
        <div slot="infos" class="field__actions">
            {#if params.triggers && params.triggers.length && !params.disabled }
                <button class="field__action field__action--triggers">
                    <svg class="action__icon" width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 8H7.25"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12.75 8H19.25"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 16H12.25"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.75 16H19.25"></path>
                        <circle cx="10" cy="8" r="2.25" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></circle>
                        <circle cx="15" cy="16" r="2.25" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></circle>
                    </svg>
                </button>
            {/if}
            {#if (type === "vec2" || type === "vec3") && !params.disabled }
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
            name={key}
            {...params}
            on:change={handleChange}
            on:click={() => value()}
        />
    </FieldSection>
    {#if isTriggerable}
    <FieldSection visible={secondaryVisible} secondary label="triggers">
        <FieldTriggers on:triggers-change={handleTriggersChange} />
    </FieldSection>
    {/if}
</div>

<style>
.field {
    --columnGap: 3px;
    --inputHeight: 20px;
    --padding: 6px;
    --borderRadius: 3px;
    --borderWidth: 1px;
    --borderColor: #000000;
    --backgroundColor: #1d1d1e;
    --spacingColor: #323233;
    --fontSize: 11px;
    --fontFamily: "Jetbrains Mono";
    --color: #f0f0f0;

    width: 100%;

    padding: 4px 0;
    border-bottom: 1px solid var(--spacingColor);
    padding-left: calc(var(--padding) * 2);
}

.field__section {
    position: relative;
    
    display: grid;
    grid-template-columns: 0.5fr 1fr;
    column-gap: 10px;
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

.field__action--triggers .action__icon {
    transform: rotate(90deg);
}

.field__action {
    display: flex;
    align-items: center;

    background: transparent;
    opacity: 0.5;
    transition: opacity 0.1s ease;
}

.field__action:hover {
    opacity: 1;
}
</style>
