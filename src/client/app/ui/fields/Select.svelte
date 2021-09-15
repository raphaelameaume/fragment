<script>
export let options = [];

let node;

function handleClick() {
    node.click();
}

</script>

<div class="container" on:click={handleClick}>
    <select class="select" bind:this={node}>
        {#each options as option}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</div>

<style>
.container {
    position: relative;

    display: flex;
    width: 100%;
    height: var(--inputHeight);
    margin-right: var(--padding);

    box-shadow: inset 0 0 0 1px var(--borderColor);
    border-radius: var(--borderRadius);
    background-color: var(--backgroundColor);

    cursor: pointer;
}

.container:hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.container:focus-within {
    box-shadow: 0 0 0 2px var(--activeColor);
}

.select {
    padding: 0 var(--padding) 0 var(--padding);

    width: 100%;
    color: rgba(255, 255, 255, 0.5);
    font-size: var(--fontSize);
    font-family: var(--fontFamily);

    outline: 0;
    background-color: transparent;
    cursor: pointer;
}

:global(.field:hover .select) {
    color: var(--color);
}

.select:focus {
    color: var(--color);
}

</style>
