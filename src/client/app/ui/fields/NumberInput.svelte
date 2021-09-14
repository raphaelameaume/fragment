<script>
import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
import { clamp } from "lemonade-math";
import Keyboard from "../../inputs/Keyboard.js";

function round(value, step) {
    return Math.round(value * (1 / step)) / (1 / step);
}

export let value;
export let label;
export let step = 0.1;
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

function update(v) {
    const sanitizedValue = sanitize(v);

    dispatch('change', sanitizedValue);
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
        const newValue = sanitize(composedValue) + direction * diff;

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

</script>

<div class="container">
    {#if label }
        <span class="label">{label}</span>
    {/if}
    <input
        class="input"
        bind:this={node}
        type="text"
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
}

.label {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    padding: 5px;

    font-size: 10px;
    font-weight: 600;
    pointer-events: none;
}

.input {
    text-align: right;
}
</style>
