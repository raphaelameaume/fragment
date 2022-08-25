<script>
import { createEventDispatcher } from "svelte";
import SelectChevrons from "../SelectChevrons.svelte";

export let options = [];
export let name = "";
export let value;
export let disabled = false;
export let title = "";

let node;
let sanitizedOptions = [];

$: {
    sanitizedOptions = [];
    
    for (let i = 0; i < options.length; i++) {
        const { value, label, disabled } = options[i];

        if (["number", "string"].includes(typeof options[i])) {
            sanitizedOptions[i] = {
                value: options[i],
                label: options[i],
                disabled,
            };
        } else {
            sanitizedOptions[i] = {
                value: value,
                label: label ? label : value,
                disabled,
            }
        }
    }
}

</script>

<div
    class="select-input"
    class:disabled={disabled}
    class:single={sanitizedOptions.length === 1}
>
    <div class="container">
        <select class="select" bind:this={node} on:change {name} {disabled} {title} bind:value={value}>
            {#each sanitizedOptions as option}
                <option value={option.value} selected={value === option.value} disabled={option.disabled}>{option.label}</option>
            {/each}
        </select>
        {#if sanitizedOptions.length > 1 }
            <SelectChevrons />
        {/if}
    </div>
</div>

<style>
.select-input {
    width: 100%;
}

.container {
    position: relative;

    display: flex;
    height: var(--height-input);
    margin: 2px 0;

    color: rgba(255, 255, 255, 0.5);

    box-shadow: inset 0 0 0 1px var(--color-border-input);
    border-radius: var(--border-radius-input);
    background-color: var(--color-background-input);
}

.select-input:not(.disabled) .container:hover {
    box-shadow: inset 0 0 0 1px var(--color-active);
}

.container:focus-within {
    box-shadow: 0 0 0 2px var(--color-active);
}

.select {
    padding: 0 var(--padding, 6px) 0 var(--padding, 6px);

    width: 100%;
    
    color: inherit;
    font-size: var(--font-size-input);

    outline: 0;
    background-color: transparent;
}

.select-input:not(.disabled) .select {
    cursor: pointer;
}

:global(.field__section:hover .select-input:not(.disabled) .container) {
    color: var(--color-text);
}

.select-input:not(.disabled) .select:focus {
    color: var(--color-text);
}

.select-input:not(.disabled) .select:hover {
    color: var(--color-text);
}

</style>
