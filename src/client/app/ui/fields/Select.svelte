<script>
export let params = {
    options: []
};
export let onChange;

let { options } = params;

</script>

<select class="select">
    {#each options as option}
        <option value={option.value}>{option.label}</option>
    {/each}
</select>

<style>
.select {
    -webkit-appearance: none;
    width: 100%;
    height: 20px;
    padding: 0 4px 0 8px;

    color: white;
    font-size: 10px;
    font-family: "Inter", system-ui, sans-serif;

    border: 1px solid #0E0E0E;
    border-radius: 3px;
    outline: 0;
    background-color: #4a4a4a;
}

</style>
