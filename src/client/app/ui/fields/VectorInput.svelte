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

$: previousValue = sanitize(value);
$: currentValue = sanitize(value);

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
    <FieldInputRow --grid-template-columns={currentValue.map(() => "1fr").join(" ")}>
        {#each currentValue as curr, index}
            <NumberInput
                {min}
                {max}
                {step}
                {suffix}
                {disabled}
                label={curr.label}
                value={curr.value}
                on:change={(event) => onValueChange(index, event.detail)}
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
