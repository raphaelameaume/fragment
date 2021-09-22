<script>
import FieldTrigger from "./FieldTrigger.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";

let triggers = [
    { input: "Mouse", event: "onMouseMove", params: {} },
    { input: "Keyboard", event: "onKeyPress", params: {
        key: "m|M"
    } },
];

function addTrigger() {
    triggers = [
        ...triggers,
        { input: undefined, event: undefined, params: undefined },
    ];
}

</script>

{#each triggers as trigger}
    <FieldTrigger input={trigger.input} event={trigger.event} params={trigger.params} />
{/each}
<ButtonInput label={"Add"} on:click={addTrigger} />
