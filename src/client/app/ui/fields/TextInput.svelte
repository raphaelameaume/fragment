<script>
import Input from "./Input.svelte";

export let value;
export let label = "";
export let name;
export let disabled = false;

</script>

<div class="text-input">
    <Input {value} {name} {label} {disabled} on:change on:input/>
</div>

<style>
.text-input {
    width: 100%;
}
</style>
