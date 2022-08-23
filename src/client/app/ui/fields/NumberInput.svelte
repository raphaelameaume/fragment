<script>
import { createEventDispatcher } from "svelte";
import FieldInputRow from "./FieldInputRow.svelte";
import Input from "./Input.svelte";
import ProgressInput from "./ProgressInput.svelte";
import Keyboard from "../../inputs/Keyboard.js";
import { clamp } from "../../utils/math.utils.js";

function round(value, step) {
    return Math.round(value * (1 / step)) / (1 / step);
}

export let value = null;
export let label = "";
export let step = 1;
export let suffix = "";
export let min = -Infinity;
export let max = Infinity;
export let disabled = false;

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

    let newValue = event.currentTarget.value;
    let isNotValid = isNaN(Number(event.currentTarget.value));

    if (isNotValid) {
        newValue = `${value}`;
    }

    currentValue = sanitize(newValue, suffix);

    dispatch('change', currentValue);
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
                {label}
                {disabled}
                on:keydown={onKeyDown}
                on:focus={onFocus}
                on:blur={onBlur}
                bind:value={composedValue}
            />
        </FieldInputRow>
    {:else}
        <Input 
            {label}
            on:keydown={onKeyDown}
            on:focus={onFocus}
            on:blur={onBlur}
            bind:value={composedValue}
        />
    {/if}
</div>

<style>
.number-input {
    position: relative;
    width: 100%;
}
</style>
