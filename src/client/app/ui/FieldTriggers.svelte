<script>
import { createEventDispatcher } from "svelte";
import FieldTrigger from "./FieldTrigger.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";

export let triggers = [];

const dispatch = createEventDispatcher();

function addTrigger() {
    triggers = [
        ...triggers,
        { input: undefined, event: undefined, params: undefined },
    ];
}

function onTriggerChange(e, index) {
    const { inputType, eventName, params = {}} = e.detail;

    triggers[index] = e.detail;

    dispatch('triggers-change', triggers);
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
