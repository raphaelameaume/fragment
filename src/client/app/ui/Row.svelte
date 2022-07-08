<script>
import { setContext } from 'svelte';
import { current as currentLayout } from "../stores/layout.js";
import RowToolBar from "./RowToolBar.svelte";

export let index;
export let current;

setContext('rowIndex', index);

let style = "";

$: {
    const templateColumns = current.cols.map((c, i) => {
        const size = c.size ? `${c.size}fr` : "1fr";

        return i === current.cols.length - 1 ? `minmax(0, ${size})` : `minmax(0, ${size}) 0px`;
    });

    style = `--z-index: ${index * 2 + 10}; grid-template-columns: ${templateColumns.join(' ')}`;
}

</script>

<div class="row" bind:this={current.$element} style="{style}">
    {#if $currentLayout.editable }
        <RowToolBar index={index} />
    {/if}
    <slot></slot>
</div>

<style>
.row {
    z-index: var(--z-index);
    position: relative;
    display: grid;
    grid-template-columns: 1fr 0px 1fr;
    grid-template-rows: minmax(0, 1fr);
    width: 100%;
    height: 100%;

    border-top: 2px solid var(----color-border);
    /* border: 1px solid #505050;
    border-radius: 2px; */
    align-items: stretch;
    background-color: var(--color-background);
}
</style>
