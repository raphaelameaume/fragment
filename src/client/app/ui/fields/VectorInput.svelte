<script>
import { createEventDispatcher } from "svelte";
import FieldInputRow from "./FieldInputRow.svelte";
import NumberInput from "./NumberInput.svelte";

export let value;
export let suffix = "";
export let min = -Infinity;
export let max = Infinity;
export let step = 0.1;
export let locked = false;
export let disabled = false;
export let context = null;
export let key = "";

const dispatch = createEventDispatcher();

$: isArray = Array.isArray(value);
$: isObject = !isArray && typeof value === "object";
$: components = isObject ? Object.values(value) : value;
$: keys = isObject ? Object.keys(value) : value.map(() => undefined);

function dispatchChange() {
    let needsUpdate = false;
    for (let i = 0; i < components.length; i++) {
        const key = isArray ? i : keys[i];

        if (value[key] !== components[i]) {
            value[key] = components[i];
            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        dispatch('change', value);
    }
}

function handleComponentChange(newValue, componentIndex) {
    let ratio = newValue / components[componentIndex];

    if (!isFinite(ratio)) {
        ratio = 1;
    }

    components = components.map((component, index) => {
        return index === componentIndex ? newValue : 
            locked ? (Math.round(component * ratio * (1/step)) / (1/step)) : component;
    });

    dispatchChange();
}

</script>

<div class="vector-container vec{components.length}" class:locked={locked}>
    <FieldInputRow --grid-template-columns={components.map(() => "1fr").join(" ")}>
        {#each components as component, index}
            <NumberInput
                {min}
                {max}
                {step}
                {suffix}
                {disabled}
                {context}
                {key}
                label={keys[index]}
                value={component}
                on:change={(event) => handleComponentChange(event.detail, index)}
            />
        {/each}
    </FieldInputRow>
</div>

<style>
.vector-container {
    width: 100%;
}

:global(.vector-container.locked .number-input:not(:last-child):after) {
    content: '';

    position: absolute;
    top: 50%;
    right: calc(var(--column-gap) * -1);
    width: var(--column-gap);
    height: 1px;

    background-color: var(--color-border-input);
}

</style>
