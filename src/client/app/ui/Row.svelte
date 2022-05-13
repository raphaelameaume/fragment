<script>
import { setContext } from 'svelte';
import { current as currentLayout } from "../stores/layout.js";
import RowToolBar from "./RowToolBar.svelte";

export let index;
export let current;

setContext('rowIndex', index);

$: style = `flex: ${current.flex};`;

</script>

<div class="row" bind:this={current.$element} style="{style}">
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

    border-top: 2px solid var(----color-border);
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
