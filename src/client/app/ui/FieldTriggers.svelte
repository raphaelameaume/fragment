<script>
import { createEventDispatcher } from "svelte";
import FieldTrigger from "./FieldTrigger.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";

export let triggers = [];

const dispatch = createEventDispatcher();

function onTriggerChange(e, index) {
    const { inputType, eventName, params = {}} = e.detail;

    const newTriggers = triggers.map((trigger, i) => {
        if (index === i) {
            return {
                inputType,
                eventName,
                params,
            };
        } else {
            return {
                inputType: trigger.inputType,
                eventName: trigger.eventName,
                params: trigger.params,
            };
        }
    });

    dispatch('triggers-change', newTriggers);
}

function onTriggerDelete(e, index) {
    const newTriggers = triggers.filter((t, i) => i !== index);
    dispatch('triggers-change', newTriggers);
}

</script>

<div class="field-triggers">
{#each triggers as trigger, index}
    <FieldTrigger
        input={trigger.inputType}
        eventName={trigger.eventName}
        params={trigger.params}
        on:change={(event) => onTriggerChange(event, index)}
        on:delete={(event) => onTriggerDelete(event, index)}
    />
{/each}
</div>

<style>
.field-triggers {
    width: 100%;
    margin-top: var(--column-gap);
}
</style>
<!-- <ButtonInput label={"Add"} on:click={addTrigger} /> -->
