<script>
import { createEventDispatcher } from "svelte";
import NumberInput from "./NumberInput.svelte";

export let value;
export let suffix;
export let min = -Infinity;
export let max = Infinity;
export let step = 0.1;
export let locked = false;

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

<div class="vector-container vec{currentValue.length}">
{#each currentValue as curr, index}
    <NumberInput controlled={true} min={min} max={max} step={step} label={curr.label} suffix={suffix} value={curr.value} on:change={(event) => onValueChange(index, event.detail)} />
{/each}
</div>

<style>
.vector-container {
    display: grid;
    column-gap: var(--columnGap);
}

.vector-container.vec2 {
    grid-template-columns: 1fr 1fr;
}

.vector-container.vec3 {
    grid-template-columns: 1fr 1fr 1fr;
}

</style>
