<script>
import { createEventDispatcher } from "svelte";
import ProgressInput from "./ProgressInput.svelte";
import Input from "./Input.svelte";
import { clamp } from "lemonade-math";
import Keyboard from "../../inputs/Keyboard.js";

function round(value, step) {
    return Math.round(value * (1 / step)) / (1 / step);
}

export let value;
export let label;
export let step = 1;
export let suffix = "";
export let min = -Infinity;
export let max = Infinity;
export let controlled = false;

let node;
let isFocused = false;
const dispatch = createEventDispatcher();

function sanitize(v) {
    return suffix !== "" ? Number(v.split(suffix)[0]) : Number(v);
}

function composeValue(v) {
    const clampedValue = clamp(v, min, max);
    const roundedValue = typeof step === "number" ? round(clampedValue, step) : v;
    
    return `${roundedValue}${suffix}`;
}

$: currentValue = value;
$: composedValue = composeValue(currentValue);

function onKeyDown(event) {
    if ([38, 40].includes(event.keyCode)) {
        event.preventDefault();

        const diff = Keyboard.getStepFromEvent(event);
        const direction = event.keyCode === 38 ? 1 : -1;
        const newValue = sanitize(composedValue) + direction * (diff);

        if (!controlled) {
            currentValue = newValue;
        } else {
            dispatch('change', newValue);
        }
    }
}

function onKeyPress(event) {
    if (event.key === 'Enter') {
        if (!controlled) {
            currentValue = sanitize(event.currentTarget.value);
            composedValue = composeValue(currentValue);
        } else {
            dispatch('change', sanitize(composeValue(sanitize(event.currentTarget.value))));
        }
    }
}

const hasProgress = isFinite(min) && isFinite(max);

</script>

<div class="container {hasProgress ? "container--progress": ""}">
    {#if hasProgress}
        <ProgressInput step={step} value={currentValue} min={min} max={max} on:change={(event) => currentValue = event.detail} />
    {/if}
        <Input 
            class="input"
            bind:this={node}
            type="text"
            label={label}
            on:keypress={onKeyPress}
            on:keydown={onKeyDown}
            on:focus={() => isFocused = true}
            on:blur={() => isFocused = false}
            value={composedValue}
            autocomplete="off"
            spellcheck="false"
        />
</div>

<style>
.container {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    column-gap: var(--columnGap);
}

.container--progress {
    grid-template-columns: 1fr 0.5fr;
}
</style>
