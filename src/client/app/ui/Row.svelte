<script>
export let index;
export let node;
export let onDelete;
export let onColumnAdd;
export let grow;

function handleDelete() {
    onDelete(index);
}

function handleColumnAdd() {
    onColumnAdd(index);
}

</script>

<div class="row" bind:this={node} style="flex: {grow};">
    <header class="header">
        <button on:click={handleColumnAdd}>Add column</button>
        <button on:click={handleDelete}>X</button>
    </header>
    <div class="container">
        <slot></slot>
    </div>
</div>

<style>
.row {
    position: relative;
    display: flex;
    justify-content: stretch;
    flex-direction: column;
    width: 100%;
    height: 100%;
    border: 1px solid #505050;
    border-radius: 2px;
}

.header {
    position: absolute;
    top: 2px;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 2px;
    flex-grow: 0;
    height: 24px;
}

.container {
    display: flex;
    width: 100%;
    height: 100%;
    flex-grow: 1;
}
</style>
