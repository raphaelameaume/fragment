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
    display: flex;
    justify-content: flex-end;
    width: 100%;
    height: var(--inputHeight);

    border: var(--borderWidth) solid var(--borderColor);
    border-radius: var(--borderRadius);
    background-color: var(--backgroundColor);

    cursor: pointer;
}

.select {
    padding: 0 4px 0 8px;

    color: white;
    font-size: var(--fontSize);
    font-family: var(--fontFamily);

    outline: 0;
    background-color: transparent;
    cursor: pointer;
}

</style>
