<script>
import FieldTrigger from "./FieldTrigger.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";

export let triggers = [];

function addTrigger() {
    triggers = [
        ...triggers,
        { input: undefined, event: undefined, params: undefined },
    ];
}

</script>

{#each triggers as trigger}
    <FieldTrigger input={trigger.input} event={trigger.event} params={trigger.params} on:change />
{/each}
<ButtonInput label={"Add"} on:click={addTrigger} />
