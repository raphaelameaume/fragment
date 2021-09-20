<script>
import { setContext } from 'svelte';
import { current as currentLayout } from "../stores/layout.js";
import RowToolBar from "./RowToolBar.svelte";

export let index;
export let node;
export let grow;

let style = "";

setContext('rowIndex', index);

$: {
    const { resizing } = $currentLayout.rows[index];

    if (resizing) {
        style = `flex: ${grow}`;
    } else {
        const total = $currentLayout.rows.reduce((t, row) => {
            return t + row.grow;
        }, 0);
        const height = $currentLayout.rows[index].grow / total;

        style = `flex: 0 0 auto; height: ${height * 100}%`;
    }
}

</script>

<div class="row" bind:this={node} style="{style}">
    {#if $currentLayout.editable }
        <RowToolBar index={index} />
    {/if}
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

    border-top: 2px solid #0E0E0E;
    /* border: 1px solid #505050;
    border-radius: 2px; */

    overflow: hidden;
}

.container {
    display: flex;
    width: 100%;
    height: 100%;
    flex-grow: 1;
}
</style>
