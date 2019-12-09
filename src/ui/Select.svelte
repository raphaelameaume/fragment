<select on:change={handleChange}>
{#each options as option}
<option value={option.key}>{option.value}</option>
{/each}
</select>

<script>
export let options = [];
export let onChange = () => {};

function handleChange(event) {
    for (let i = 0; i < options.length; i++) {
        if (options[i].key === event.target.value) {
            onChange(options[i]);
        }
    }
}
</script>

<style>
select {
    position: relative;
}
</style>