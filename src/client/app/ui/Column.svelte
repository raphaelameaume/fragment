<script>
export let grow = 1;
export let node;
</script>

<div class="column" style="flex: {grow}" bind:this={node}>
    <header class="header">
        <button>Add module</button>
        <button>X</button>
    </header>
    <div class="container">
        <slot></slot>
    </div>
</div>

<style>
.column {
    position: relative;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: stretch;
    margin: 0 2px 2px;
    padding: 2px;
    border: 1px solid #505050;
    border-radius: 2px;
}

.header {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 5px;
    flex-grow: 0;
    height: 24px;
}

.container {
    overflow-y: scroll;
    flex-grow: 1;
}

.container::-webkit-scrollbar {
  width: 5px;               /* width of the entire scrollbar */
}

.container::-webkit-scrollbar-track {
  background: transparent;        /* color of the tracking area */
}

.container::-webkit-scrollbar-thumb {
  background-color: rgb(174, 174, 185);    /* color of the scroll thumb */
  border-radius: 20px;       /* roundness of the scroll thumb */
}
</style>
