<script>
import FieldTrigger from "./FieldTrigger.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";
import { getPersistentStore } from "../stores/utils";
import { writable } from "svelte/store";

export let key;
export let context;
export let onTrigger;
export let persist = true;
export let triggerable = false;
export let controllable = false;

const store = getPersistentStore(context, !persist, { props: {}});
if (!$store.props[key]) {
    $store.props[key] = { triggers: [] };
}

let triggers = writable($store.props[key].triggers.filter((trigger) => trigger.inputType !== undefined));

triggers.subscribe((all) => {
    store.update((curr) => {
        curr.props[key].triggers = all;

        return curr;
    });
})

function onTriggerDelete(e) {
    const triggerIndex = e.detail;

    $triggers = $triggers.filter((t, i) => i !== triggerIndex);
}

function handleClickAdd() {
    triggers.update((current) => {
        return [
            ...current,
            {
                inputType: undefined,
                eventName: undefined,
            },
        ]
    });
}
</script>

{#if onTrigger }
    <ButtonInput label="add trigger" on:click={handleClickAdd} />
    <div class="field-triggers">
    {#each $triggers as trigger, index}
        <FieldTrigger
            {index}
            bind:inputType={trigger.inputType}
            bind:eventName={trigger.eventName}
            bind:params={trigger.params}
            bind:enabled={trigger.enabled}
            {onTrigger}
            {context}
            {controllable}
            {triggerable}
            on:delete={onTriggerDelete}
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
