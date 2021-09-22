<script>
import { createEventDispatcher } from "svelte";
import NumberInput from "./NumberInput.svelte";

export let value;
export let name;
export let suffix = "";
export let min = -Infinity;
export let max = Infinity;
export let step = 0.1;
export let locked = false;
export let triggers = [];

function sanitize(value, type) {
    if (Array.isArray(value)) {
        return value.reduce((all, v, index) => {
            if (typeof v === "number") {
                all[index] = {
                    value: v,
                    label: ""
                }
            } else {
                all[index] = v;
            }

            return all;
        }, []);
    } else {
        return Object.keys(value).map((key) => {
            return { label: key, value: value[key] }
        });
    }
}

function desanitize(updated) {
    if (Array.isArray(value)) {
        return updated.map((v) => v.value);
    }

    return updated;
}

let previousValue = sanitize(value);
let currentValue = sanitize(value);

const dispatch = createEventDispatcher();

function onValueChange(index, newValue) {
    const prevValue = previousValue[index].value;
    const ratio = newValue / prevValue;

    const updated = currentValue.map((v, i) => {
        return {
            ...v,
            value: i === index ? newValue : 
                locked ? (Math.round(previousValue[i].value * ratio * (1/step)) / (1/step)) :
                v.value
        };
    });

    currentValue = updated;

    dispatch("change", desanitize(updated));
}

</script>

<div class="vector-container vec{currentValue.length}" class:locked={locked}>
{#each currentValue as curr, index}
    <NumberInput
        controlled
        {min}
        {max}
        {step}
        {suffix}
        {name}
        label={curr.label}
        value={curr.value}
        on:change={(event) => onValueChange(index, event.detail)}
    />
{/each}
</div>

<style>
.vector-container {
    display: grid;
    width: 100%;
    column-gap: var(--columnGap);
}

:global(.vector-container.locked > *:not(:last-child):after) {
    content: '';

    position: absolute;
    top: 50%;
    right: calc(var(--columnGap) * -1);
    width: calc(var(--columnGap) + var(--padding));
    height: 1px;

    background-color: var(--borderColor);
}

:global(.xxsmall .vector-container.locked > *:not(:last-child):after) {
    content: '';

    position: absolute;
    top: calc(100% - 2px);
    left: calc(50% - var(--padding) * 0.5);
    width: 1px;
    height: calc(var(--padding));

    /* background-color: red; */
}

.vector-container.vec2 {
    grid-template-columns: 1fr 1fr;
}

:global(.xxsmall) .vector-container.vec2{
    grid-template-columns: 1fr;
}

.vector-container.vec3 {
    grid-template-columns: 1fr 1fr 1fr;
}

:global(.xsmall) .vector-container.vec3{
    grid-template-columns: 1fr;
}

:global(.xxsmall) .vector-container.vec3{
    grid-template-columns: 1fr;
}

</style>
