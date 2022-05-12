<script>
import { createEventDispatcher } from "svelte";
import FieldTrigger from "./FieldTrigger.svelte";
import * as triggersMap from "../triggers/index.js";
import ButtonInput from "./fields/ButtonInput.svelte";
import Trigger from "../triggers/Trigger";
import { getPersistentStore } from "../stores/utils";

export let key;
export let context;
export let onTrigger;
export let persist = true;

const dispatch = createEventDispatcher();
const store = getPersistentStore(context, !persist);

if (!$store.props[key]) {
    $store.props[key] = { triggers: [] };
}

let triggers = $store.props[key].triggers
    .filter(t => triggersMap[t.eventName])
    .map(t => {
        const { eventName, enabled, params } = t;
        const createTrigger = triggersMap[eventName];
        const trigger = createTrigger(onTrigger, {
            ...params,
            context,
            hot: false,
            enabled,
        });

        return trigger;
    });

function onTriggerChange(e) {
    let trigger = e.detail;
    const { eventName, params, enabled } = trigger;

    triggers = triggers.map((t) => {
        if (t.id !== trigger.id) return t;

        const createTrigger = triggersMap[eventName];

        if (createTrigger) {
            // destroy previous one
            trigger.destroy();
            return createTrigger(onTrigger, {
                ...params,
                context,
                enabled,
                hot: false,
             });
        }

        return trigger;
    });
}

function onTriggerDelete(e) {
    let trigger = e.detail;
    triggers = triggers.filter((t) => t.id !== trigger.id);

    trigger.destroy();
}

function handleClickAdd() {
    let trigger = new Trigger();
    triggers = [
        ...triggers,
        trigger,
    ]
}

$: {
    dispatch('change', triggers);

    store.update((curr) => {
        let clone = {...curr};

        clone.props[key].triggers = triggers;

        return clone;
    });
}

</script>

{#if onTrigger }
    <ButtonInput label="add trigger" on:click={handleClickAdd} />
    <div class="field-triggers">
    {#each triggers as trigger, index}
        <FieldTrigger
            {trigger}
            on:change={onTriggerChange}
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
<!-- <ButtonInput label={"Add"} on:click={addTrigger} /> -->
