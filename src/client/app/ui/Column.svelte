<script>
import { setContext, getContext } from 'svelte';
import { current as currentLayout } from "../stores/layout.js";

export let index;
export let current;

setContext("colIndex", index);

let style = "";

$: {
    const templateRows = current.modules.map((m, i) => {
        const size = m.minimized ? "25px" : "auto";
        return i === current.modules.length - 1 ? `minmax(0, ${size})` : `minmax(0, ${size}) 0px`;
    }).join(' ');


    style = `grid-template-rows: ${templateRows};`;

    if (current.modules.length === 1) {
        style = `grid-template-rows: minmax(25px, 1fr)`;
        // style += `align-content: center;`;
    }
}


</script>

<div class="column" style={style} bind:this={current.$element}>
    {#if $currentLayout.editable }
      <header class="header">
          <button>Add module</button>
          <button>X</button>
      </header>
    {/if}
    <slot></slot>
</div>

<style>
.column {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    align-content: flex-start;
}

.column:not(:last-child) {
    border-right: 1px solid var(--color-lightblack);
}

.column:not(:first-child) {
    border-left: 1px solid var(--color-lightblack);
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
</style>
