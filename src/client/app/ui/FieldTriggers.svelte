<script>
import { createEventDispatcher } from "svelte";
import FieldTrigger from "./FieldTrigger.svelte";
import * as triggersMap from "../triggers/index.js";
import ButtonInput from "./fields/ButtonInput.svelte";
import Trigger from "../triggers/Trigger";

export let triggers = [];
export let context;
export let onTrigger;

const dispatch = createEventDispatcher();

function onTriggerChange(e, triggerIndex) {
    const { eventName } = e.detail;

    triggers = triggers.map((trigger, index) => {
        if (triggerIndex !== index) return trigger;

        // destroy previous one
        trigger.destroy();

        trigger = triggersMap[eventName];

        if (trigger) {
            return trigger(onTrigger, {
                ...e.detail,
                context,
             });
        }

        trigger = new Trigger({...e.detail});

        return trigger;
    });

    dispatch('change', triggers);
}

function onTriggerDelete(e, index) {
    triggers = triggers.filter((t, i) => i !== index);

    dispatch('change', triggers);
}

function handleClickAdd() {
    triggers = [
        ...triggers,
        new Trigger()
    ]

    dispatch('change', triggers);
}

</script>

{#if onTrigger }
    <ButtonInput label="add trigger" on:click={handleClickAdd} />
    <div class="field-triggers">
    {#each triggers as trigger, index}
        <FieldTrigger
            {trigger}
            input={trigger.inputType}
            eventName={trigger.eventName}
            params={trigger.params}
            on:change={(event) => onTriggerChange(event, index)}
            on:delete={(event) => onTriggerDelete(event, index)}
        />
    {/each}
    </div>
{/if}

<style>
.field-triggers {
    width: 100%;
}

.field-triggers:not(:empty) {
    margin-top: var(--column-gap);
}
</style>
<!-- <ButtonInput label={"Add"} on:click={addTrigger} /> -->
