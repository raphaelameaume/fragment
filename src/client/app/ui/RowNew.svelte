<script>
import { getContext, setContext, hasContext, onDestroy, onMount } from "svelte";
import { writable } from "svelte/store";
import { layoutID } from "../stores/layout";
import { map } from "../utils/math.utils";
import Resizer from "./ResizerNew.svelte";

export let size = 1;

let depth = hasContext('depth') ? (getContext('depth') + 1) : 0;
setContext('depth', depth);

let children = writable([]);
let layout = getContext('layout');
let data = getContext('data');
let parent = getContext('parent');
let index;
let node;
let siblings = [];

let id;

setContext('prevParent', parent);
setContext('parent', children);

children.subscribe(() => {
	const idx = $data.findIndex(d => d.id === id);

	if (idx >= 0) {
		$data = $data.map((d, i) => {
			if (i !== idx) return d;

			return {...d, children: $children };
		});
	}
});

onMount(() => {
	index = $parent.length;
	id = $layoutID++;

	$data = [...$data, { id, index, depth, size, children: $children }];
	$parent = [...$parent, id ];
});

$: siblings = $data.filter(e => e.depth === depth).filter((e) => e.index !== index);
$: console.log("test");

onDestroy(() => {
	const childIndex = $parent.findIndex((c) => c === id);

	$parent = [...$parent].slice(childIndex, 1);
	$data = $data.filter(d => d.id !== id);
});

let style = "";

$: {
    const templateColumns = $children.map((c, i) => {
		const col = $data.find(d => c.id === id);

		if (col) {
        	const size = col.size ? `${col.size}fr` : "1fr";
        	return i === $children.length - 1 ? `minmax(0, ${size})` : `minmax(0, ${size}) 0px`;
		}

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
