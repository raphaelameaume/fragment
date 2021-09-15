<script>
import Input from "./Input.svelte";

export let value;

</script>

<div class="text-input">
    <Input value={value} on:change on:input/>
</div>

<style>
.text-input {
    width: 100%;
}
</style>
