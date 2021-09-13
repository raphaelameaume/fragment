<script>
import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";

export let grow;

const options = [
    { value: 0, label: "Stage 1" },
    { value: 1, label: "Stage 2" },
    { value: 2, label: "Stage 3" },
];

function onStageChange(event) {
    console.log(event);
}

const params = {
    options,
};

</script>

<Module grow={grow}>
    <Field name="Current Stage" type="select" params={params} onChange={onStageChange} />
</Module>
