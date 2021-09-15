<script>
export let name;
export let value;

let test = true;

function onChange() {
    console.log("onchange");
}


</script>

<div class="checkbox">
    <input class="input" bind:checked={test} type="checkbox" on:change={onChange} />
</div>

<style>
.input {
    width: var(--inputHeight);
    height: var(--inputHeight);
    border: var(--borderWidth) solid var(--borderColor);
    border-radius: var(--borderRadius);
    background-color: transparent;
}

.input:checked {
    background-color: var(--activeColor);
}
</style>
