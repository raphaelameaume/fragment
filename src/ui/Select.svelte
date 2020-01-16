<select on:change={handleChange} bind:this={select} value={current}>
{#each options as option}
<option value={option.key}>{option.label}</option>
{/each}
</select>

<script>
export let options = [];
export let value = options[0];

$: current = value.key;

export let onChange = () => {};

let select;

function handleChange(event) {
    current = event.target.value;

    for (let i = 0; i < options.length; i++) {
        if (options[i].key === current) {
            onChange(options[i]);
        }
    }

    select.blur();
}
</script>

<style>
select {
    position: relative;

    margin: 0;
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