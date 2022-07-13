<script>
import { afterUpdate, getContext, hasContext, onDestroy, onMount, setContext, tick } from "svelte";
import { writable } from "svelte/store";
import ResizerNew from "./ResizerNew.svelte";

export let size = 1;
export let type = "column";

const parent = getContext('parent');
const depth = hasContext('depth') ? (getContext('depth') + 1) : 0;
const children = writable([]);

$: isColumn = type === "column";
$: isRow = !isColumn;
$: isRoot = !parent;

let style = "";
let node;
let current = {
	node: null,
	style,
	depth,
	size,
	minimized: false,
};

$: {
	let property = ``, value = ``;

	if ($children.length > 1) {
		if (isColumn) {
			property = `grid-template-rows`;
			value = $children.map((row, i) => {
				let size = `${row.size}fr`;

				return `minmax(25px, ${size}) 0px`;
			}).join(' ');
		} else {
			property = `grid-template-columns`;
			value = $children.map((col, i) => {
				let size = `${col.size}fr`;

				return `minmax(25px, ${size}) 0px`;
			}).join(' ');
		}
	}

	style = `${property}:${value}`;
}

if (parent) {
	parent.registerChild(current);
}

setContext('parent', {
	children,
	registerChild: (child) => {
		$children = [...$children, child];

		onDestroy(() => {
			$children = $children.filter((c) => c !== child);
		});
	}
});

</script>

<div class:column={isColumn} class:root={isRoot} class:row={isRow} bind:this={current.node} class:minimized={current.minimized} style={style}>
	<slot></slot>
</div>
{#if !isRoot}
<ResizerNew direction={isColumn ? "vertical" : "horizontal"} {current} {parent} />
{/if}

<style>
.root {
	align-content: stretch;
	width: 100%;
    height: 100%;
}

.column {
	position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(25px, 1fr);
}

.row {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(25px, 1fr);
    width: 100%;
    height: 100%;

    border-top: 2px solid var(----color-border);
    background-color: var(--color-background);
}
</style>
