<script>
import { createEventDispatcher } from "svelte";
import ProgressInput from "./ProgressInput.svelte";
import Input from "./Input.svelte";
import { clamp } from "lemonade-math";
import Keyboard from "../../inputs/Keyboard.js";
import FieldInputRow from "./FieldInputRow.svelte";

function round(value, step) {
    return Math.round(value * (1 / step)) / (1 / step);
}

export let value = null;
export let name = "";
export let label = "";
export let step = 1;
export let suffix = "";
export let min = -Infinity;
export let max = Infinity;
export let controlled = false;
export let disabled = false;
export let triggers = [];

let node;
$: isFocused = false;
const dispatch = createEventDispatcher();

function sanitize(v, suffix) {
    return (suffix && suffix !== "") ? Number(v.split(suffix)[0]) : Number(v);
}

function composeValue(v, isFocused, suffix = "") {
    const clampedValue = clamp(v, isFinite(min) ? min : -Infinity, isFinite(max) ? max : Infinity);
    const roundedValue = typeof step === "number" ? round(clampedValue, step) : v;

    return isFocused ? `${roundedValue}` : `${roundedValue}${suffix}`;
}

$: currentValue = value;
$: composedValue = composeValue(currentValue, isFocused, suffix);

function onFocus() {
    isFocused = true;
}

function onBlur(event) {
    isFocused = false;

    if (!controlled) {
        currentValue = sanitize(event.currentTarget.value, suffix);
        composedValue = composeValue(currentValue);

        dispatch('change', currentValue);
    } else {
        dispatch('change', sanitize(composeValue(sanitize(event.currentTarget.value, suffix))));
    }
}

function onKeyDown(event) {
    if ([38, 40].includes(event.keyCode)) {
        event.preventDefault();

        const diff = Keyboard.getStepFromEvent(event) * step;
        const direction = event.keyCode === 38 ? 1 : -1;
        const newValue = sanitize(composedValue, suffix) + direction * (diff);

        if (!controlled) {
            currentValue = newValue;
            dispatch('change', currentValue);
        } else {
            dispatch('change', newValue);
        }
    }
}

function onKeyPress(event) {
    if (event.key === 'Enter') {
        onBlur(event);
        event.currentTarget.blur();
    }
}

$: hasProgress = isFinite(min) && isFinite(max);

function handleChangeProgress(event) {
    currentValue = event.detail;
    dispatch('change', event.detail);
}

</script>

<div class="number-input {hasProgress ? "number-input--with-progress": ""}">
    {#if hasProgress}
        <FieldInputRow --grid-template-columns="1fr 0.5fr">
            <ProgressInput
                step={step}
                value={currentValue}
                min={min}
                max={max}
                on:change={handleChangeProgress}
            />
            <Input 
                bind:this={node}
                {name}
                {label}
                on:keypress={onKeyPress}
                on:keydown={onKeyDown}
                on:focus={onFocus}
                on:blur={onBlur}
                value={composedValue}
            />
        </FieldInputRow>
    {:else}
        <Input 
            bind:this={node}
            {name}
            {label}
            on:keypress={onKeyPress}
            on:keydown={onKeyDown}
            on:focus={onFocus}
            on:blur={onBlur}
            value={composedValue}
        />
    {/if}
</div>

<style>
.number-input {
    position: relative;
    width: 100%;
}
</style>
