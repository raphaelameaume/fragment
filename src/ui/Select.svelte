<select on:change={handleChange} bind:this={select}>
{#each options as option}
<option value={option.key}>{option.value}</option>
{/each}
</select>

<script>
export let options = [];
export let onChange = () => {};

let select;

function handleChange(event) {
    for (let i = 0; i < options.length; i++) {
        if (options[i].key === event.target.value) {
            onChange(options[i]);
        }
    }

    select.blur();
}
</script>

<style>
select {
    position: relative;
    
    margin: 1px auto;

    color: #f0f0f0;
    font-size: 10px;
    
    border: 1px solid black;
    border-radius: 2px;
    background: #1d1d1e;
    outline: 0;
    cursor: pointer;
}

select:hover, select:focus {
    background: #131314;
}

select:active {
    background-color: #448eea;
}

</style>