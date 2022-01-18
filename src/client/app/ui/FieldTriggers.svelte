<script>
import { createEventDispatcher } from "svelte";
import FieldTrigger from "./FieldTrigger.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";

export let triggers = [];

const dispatch = createEventDispatcher();

function addTrigger() {
    dispatch('triggers-change', [
        ...triggers,
        { inputType: undefined, eventName: undefined, params: {} },
    ]);
}

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

</script>

{#each triggers as trigger, index}
    <FieldTrigger
        input={trigger.inputType}
        eventName={trigger.eventName}
        params={trigger.params}
        on:change={(event) => onTriggerChange(event, index)}
    />
{/each}
<ButtonInput label={"Add"} on:click={addTrigger} />
