<script>
import { getContext, hasContext, onDestroy, onMount, setContext } from "svelte";

import { derived, writable } from "svelte/store";
import Resizer from "./ResizerNew.svelte";

export let size = 1;

let children = writable([]);
let depth = hasContext('depth') ? (getContext('depth') + 1) : 0;
setContext('depth', depth);

let layout = getContext('layout');
let parent = getContext('parent');
let index, node;

setContext('prevParent', parent);
setContext('parent', children);

onMount(() => {
	index = layout.getSiblings({ depth }).length;

	$parent = [...$parent, { index, node, size }];

	layout.addChild({
		depth,
		node,
		index,
		size,
	});
})

let siblings = [];

layout.all.subscribe(() => {
	siblings = layout.getSiblings({ depth }).filter((n => n.index !== index));
})

onDestroy(() => {
	layout.removeChild();

	const childIndex = $parent.findIndex((c) => c.index === index);

	$parent = [...$parent].slice(childIndex, 1);
});

let style = "";


$: console.log("Column ::", $children);
$: {
	if ($children.length > 1) {
		const templateRows = $children.map((row, i) => {
			const size = row.size ? `${row.size}fr` : "1fr";
			return i === $children.length - 1 ? `minmax(0, ${size})` : `minmax(0, ${size}) 0px`;
		}).join(' ');

		style = `grid-template-rows: ${templateRows};`;
	} else {
		style = "";
	}
}

</script>

<div class="column" style={style} bind:this={node}>
	<slot></slot>
</div>
{#if index < siblings.length}
<Resizer direction="vertical" {index}/>
{/if}

<style>
.column {
	position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(25px, 1fr);
    align-content: flex-start;

	/* background-color: red; */
	/* border: 2px dashed rgba(255, 0, 0, 0.5); */
}
</style>
