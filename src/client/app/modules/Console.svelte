<script>
import Module from "../ui/Module.svelte";
import ListInput from "../ui/fields/ListInput.svelte";

const items = [
    "hello",
    "world",
];

</script>

<Module name="Console">
    <ListInput value={items} />
</Module>
