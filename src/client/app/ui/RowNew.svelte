<script>
import { getContext, setContext } from "svelte";
import { hasContext, onDestroy, onMount } from "svelte/internal";
import { writable } from "svelte/store";
import Resizer from "./ResizerNew.svelte";

export let size = 1;

let parent = hasContext('col') ? getContext('col') : writable([]);
let index;
let node;

onMount(() => {
	index = $parent.length;
	$parent = [...$parent, { index, size, node }];
});

onDestroy(() => {
	$parent = [...$parent].slice(index, 1);
});

const children = writable([]);
setContext('row', children);

let style = "";

$: {
    const templateColumns = $children.map((c, i) => {
        const size = c.size ? `${c.size}fr` : "1fr";

        return i === $children.length - 1 ? `minmax(0, ${size})` : `minmax(0, ${size}) 0px`;
    });

	if ($children.length > 0) {
    	style = `--z-index: ${index * 2 + 10}; grid-template-columns: ${templateColumns.join(' ')}`;
	} else {
		style = "";
	}
}

</script>

<div class="row" style={style} bind:this={node}>
	<slot></slot>
</div>
{#if index < $parent.length - 1}
<Resizer direction="horizontal" {index}/>
{/if}

<style>
.row {
    z-index: var(--z-index);
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
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
