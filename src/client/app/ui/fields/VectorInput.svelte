<script>
import { beforeUpdate, afterUpdate } from "svelte";
import NumberInput from "./NumberInput.svelte";

export let value;
export let suffix;
export let step = 0.1;
export let locked = false;
export let onChange = () => {};

let previousValue = [...value];
let currentValue = [...value];

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
}

</script>

{#each currentValue as curr, index}
    <NumberInput step={step} label={curr.label} suffix={suffix} value={curr.value} on:change={(event) => onValueChange(index, event.detail)} />
{/each}
