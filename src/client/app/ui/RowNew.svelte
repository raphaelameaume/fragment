<script>
import { getContext, setContext, hasContext, onDestroy, onMount } from "svelte";
import { writable } from "svelte/store";
import Resizer from "./ResizerNew.svelte";

export let size = 1;

let depth = hasContext('depth') ? (getContext('depth') + 1) : 0;
setContext('depth', depth);

let children = writable([]);
let layout = getContext('layout');
let parent = getContext('parent');
let index;
let node;
let siblings = [];

setContext('prevParent', parent);
setContext('parent', children);

$: console.log("RowNew", $children, $parent);

onMount(() => {
	index = layout.getSiblings({ depth }).length;

	$parent = [...$parent, { index, node, size }];

	layout.addChild({
		depth,
		node,
		index,
		size,
		parent,
	});
});


layout.all.subscribe(() => {
	siblings = layout.getSiblings({ depth }).filter((n => n.index !== index));
})

onDestroy(() => {
	layout.removeChild();

	const childIndex = $parent.findIndex((c) => c.index === index);

	$parent = [...$parent].slice(childIndex, 1);
});


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
{#if index < siblings.length}
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
    background-color: var(--color-background);
}
</style>
