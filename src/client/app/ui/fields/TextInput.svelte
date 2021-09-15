<script>
import Input from "./Input.svelte";

export let value;

</script>

<Input value={value} on:change on:input/>
