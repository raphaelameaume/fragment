<script>
import { setContext, getContext } from 'svelte';
import { current as currentLayout } from "../stores/layout.js";

export let grow = 1;
export let index;
export let node;

let style = "";

let rowIndex = getContext("rowIndex");
setContext("colIndex", index);

$: {
    const { resizing } = $currentLayout.rows[rowIndex].cols[index];

    if (resizing) {
        style = `flex: ${grow}`;
    } else {
        const total = $currentLayout.rows[rowIndex].cols.reduce((t, col) => {
            return t + col.grow;
        }, 0);
        const width = $currentLayout.rows[rowIndex].cols[index].grow / total;

        style = `flex: 0 0 auto; width: ${width * 100}%`;
    }
}

</script>

<div class="column" style={style} bind:this={node}>
    {#if $currentLayout.editable }
      <header class="header">
          <button>Add module</button>
          <button>X</button>
      </header>
    {/if}
    <div class="container">
        <slot></slot>
    </div>
</div>

<style>
.column {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
}

.column:not(:last-child) {
    border-right: 1px solid #0E0E0E;
}

.column:not(:first-child) {
    border-left: 1px solid #0E0E0E;
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
    position: relative;

    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
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
