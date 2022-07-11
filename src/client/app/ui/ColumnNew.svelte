<script context="module">
let ID = 0;
</script>

<script>
import { getContext, hasContext, onDestroy, onMount, setContext } from "svelte";

import { derived, writable } from "svelte/store";
import { layoutID } from "../stores/layout";
import Resizer from "./ResizerNew.svelte";

export let size = 1;

let children = writable([]);
let depth = hasContext('depth') ? (getContext('depth') + 1) : 0;
setContext('depth', depth);

let layout = getContext('layout');
let parent = getContext('parent');
let data = getContext('data');
let index, node;

let id = $layoutID;
$layoutID++;

setContext('prevParent', parent);
setContext('parent', children);

onMount(() => {
	index = $parent.length;
	id = $layoutID++;

	$data = [...$data, { id, index, depth, size, children: $children }];
	$parent = [...$parent, id ];
})

children.subscribe(() => {
	const index = $data.findIndex(d => d.id === id);

	if (index >= 0) {
		$data = $data.map((d, i) => {
			if (i !== index) return d;

			return {...d, children: $children };
		});
	}
});

$: siblings = $data.filter(e => e.depth === depth).filter((e) => e.index !== index);

onDestroy(() => {
	const childIndex = $parent.findIndex((c) => c === id);

	$parent = [...$parent].slice(childIndex, 1);
	$data = $data.filter(d => d.id !== id);
});

let style = "";


$: {
	console.log("column", $children);
	if ($children.length > 1) {
		const templateRows = $children.map((id, i) => {
			const row = $data.find(d => d.id === id);

			if (row) {
				const size = row.size ? `${row.size}fr` : "1fr";
				return i === $children.length - 1 ? `minmax(0, ${size})` : `minmax(0, ${size}) 0px`;
			}
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
