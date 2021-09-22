<script>
import { createEventDispatcher } from "svelte";

export let name;
export let value;
export let triggers = [];

const dispatch = createEventDispatcher();

function handleChange() {
    dispatch("change", value);
}

</script>

<div class="checkbox">
    <input class="input" bind:checked={value} type="checkbox" on:change={handleChange} {name} />
    <div class="checked">
    </div>
</div>

<style>
.checkbox {
    position: relative;

    width: var(--inputHeight);
    height: var(--inputHeight);
    margin-right: calc(var(--padding));
    box-shadow: inset 0 0 0 1px var(--borderColor);

    border-radius: var(--borderRadius);
    background-color: var(--backgroundColor);
}

.checkbox:hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.checkbox:focus-within {
    box-shadow: 0 0 0 2px var(--activeColor);
}

.input {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: var(--borderRadius);
    background-color: transparent;
}

/* .input:checked {
    background-color: var(--activeColor);
} */

.checked {
    position: absolute;
    left: 3px;
    top: 3px;
    bottom: 3px;
    right: 3px;

    border-radius: calc(var(--borderRadius) * 0.5);
    background-color: var(--activeColor);

    opacity: 0;
    pointer-events: none;
}

.input:checked + .checked {
    opacity: 1;
}
</style>
