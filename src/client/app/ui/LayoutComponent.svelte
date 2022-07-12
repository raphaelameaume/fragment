<script>
import { getContext, hasContext, onDestroy, setContext } from "svelte";
import { writable } from "svelte/store";

export let size = 1;
export let type = "column";

const parent = getContext('parent');
const depth = hasContext('depth') ? (getContext('depth') + 1) : 0;
const children = writable([]);

$: isColumn = type === "column";
$: isRow = !isColumn;

let style = "";
let current = {
	node: null,
	style,
	depth,
	size,
};

$: {
	let property = ``, value = ``;

	if ($children.length > 1) {
		if (isColumn) {
			property = `grid-template-rows`;
			value = $children.map((row, i) => {
				console.log(row);
				const size = row.size ? `${row.size}fr` : "1fr";

				return `minmax(25px, ${size})`;
			}).join(' ');
		} else {
			property = `grid-template-columns`;
			value = $children.map((col, i) => {
				const size = col.size ? `${col.size}fr` : "1fr";
				return `minmax(0, ${size})`;
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

<div class:column={isColumn} class:row={isRow} bind:this={current.node} style={style}>
	<slot></slot>
</div>

<style>
.column {
	position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(25px, 1fr);
    align-content: flex-start;
}

.row {
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
