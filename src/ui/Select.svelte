<select on:change={handleChange}>
{#each options as option}
<option value={option.key}>{option.value}</option>
{/each}
</select>

<script>
export let options = [];
export let onChange = () => {};

function handleChange(event) {
    console.log('handle change');
}
</script>