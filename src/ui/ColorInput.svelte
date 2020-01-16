<div class="container" style="background-color: {value}">
    <input type="color" class="input" value={value} on:change={handleChange} />
</div>

<script>
import noop from "../utils/noop.js";

export let value;
export let onChange = noop;

function handleChange(event) {
    onChange(event.currentTarget.value);
}


</script>
<style>
.container {
    display: flex;
    width: 100%;
    height: 20px;
    padding: 0;
    margin: 0;

    border: none;
    background-color: transparent;
    border-radius: 0;
    outline: 0;
    border-radius: 2px;
    border: 1px solid black;
}

.input {
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}
</style>