<script>
import { getContext, hasContext, onDestroy, onMount, setContext } from "svelte";

import { writable } from "svelte/store";
import Resizer from "./ResizerNew.svelte";

export let size = 1;

let parent = hasContext('row') ? getContext('row') : writable([]);
let index;
let node;

onMount(() => {
	index = $parent.length;
	$parent = [...$parent, { index, size, node }];
})

onDestroy(() => {
	$parent = [...$parent].slice(index, 1);
});

const children = writable([]);

setContext('col', children);

let style = "";

$: {
	const templateRows = $children.map((row, i) => {
        const size = row.size ? `${row.size}fr` : "1fr";
        return i === $children.length - 1 ? `minmax(0, ${size})` : `minmax(0, ${size}) 0px`;
    }).join(' ');

    style = `grid-template-rows: ${templateRows};`;

    if ($children.length === 1) {
        style = `grid-template-rows: minmax(25px, 1fr)`;
    }
}

</script>

<div class="column" style={style} bind:this={node}>
	<slot></slot>
</div>
{#if index < $parent.length - 1}
<Resizer direction="vertical" {index}/>
{/if}

<style>
.column {
	position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    align-content: flex-start;
}
</style>
