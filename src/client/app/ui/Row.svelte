<script>
import { current as currentLayout } from "../stores/layout.js";
import RowToolBar from "./RowToolBar.svelte";

export let index;
export let node;
export let grow;

</script>

<div class="row" bind:this={node} style="flex: {grow};">
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
    /* border: 1px solid #505050;
    border-radius: 2px; */
}

.container {
    display: flex;
    width: 100%;
    height: 100%;
    flex-grow: 1;
}
</style>
