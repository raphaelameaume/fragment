<script>
import { createEventDispatcher } from "svelte";

export let options = [];
export let name;
export let value;
export let triggers = [];
export let disabled = false;

const dispatch = createEventDispatcher();

let node;
let sanitizedOptions = [];

for (let i = 0; i < options.length; i++) {
    const { value, label, disabled } = options[i];

    if (value) {
        sanitizedOptions[i] = {
            value: value,
            label: label ? label : value,
            disabled,
        }
    } else {
        sanitizedOptions[i] = {
            value: options[i],
            label: options[i],
            disabled,
        };
    }
}

function handleChange() {
    dispatch('change', event.currentTarget.value);
}

</script>

<div class="select-input" class:disabled={disabled}>
    <div class="container">
        <select class="select" bind:this={node} on:change={handleChange} {name} {disabled}>
            {#each sanitizedOptions as option}
                <option value={option.value} selected={value === option.value} disabled={option.disabled}>{option.label}</option>
            {/each}
        </select>
        <div class="chevrons">
            <svg class="chevron chevron-bottom" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 10.75L12 14.25L8.75 10.75"></path>
            </svg>
        </div>
    </div>
</div>

<style>
.select-input {
    width: 100%;
}

.container {
    position: relative;

    display: flex;
    height: var(--inputHeight);
    margin: 2px 0;
    margin-right: var(--padding);

    color: rgba(255, 255, 255, 0.5);

    box-shadow: inset 0 0 0 1px var(--borderColor);
    border-radius: var(--borderRadius);
    background-color: var(--backgroundColor);
}

.select-input:not(.disabled) .container:hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.container:focus-within {
    box-shadow: 0 0 0 2px var(--activeColor);
}

.select {
    padding: 0 var(--padding) 0 var(--padding);

    width: 100%;
    
    color: inherit;
    font-size: var(--fontSize);
    font-family: var(--fontFamily);

    outline: 0;
    background-color: transparent;
}

.select-input:not(.disabled) .select {
    cursor: pointer;
}

:global(.field__section:hover .select-input:not(.disabled) .container) {
    color: var(--color);
}

.select-input:not(.disabled) .select:focus {
    color: var(--color);
}

.chevrons {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    width: 20px;

    pointer-events: none;
}

.select-input.disabled .chevrons {
    opacity: 0.5;
}

</style>
