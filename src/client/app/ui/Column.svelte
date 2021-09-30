<script>
import { setContext, getContext } from 'svelte';
import { current as currentLayout } from "../stores/layout.js";

export let index;
export let current;

let rowIndex = getContext("rowIndex");
setContext("colIndex", index);

$: style = `flex: ${current.flex}`;

</script>

<div class="column" style={style} bind:this={current.$element}>
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
    justify-content: flex-start;
}
</style>
