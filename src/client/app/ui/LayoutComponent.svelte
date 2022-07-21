<script context="module">
let ID = 0;
</script>

<script>
import { afterUpdate, beforeUpdate, getContext, hasContext, onDestroy, onMount, setContext } from "svelte";
import { writable } from "svelte/store";
import { addChild, addSibling, current as currentLayout, replaceChildren } from "../stores/layout";
import Field from "./Field.svelte";
import ModuleRendererNew, { moduleNames } from "./ModuleRendererNew.svelte";

import ResizerNew from "./ResizerNew.svelte";

export let size = 1;
export let type = "column";
export let tree = { children: [] };

const layout = getContext('layout');
const parent = hasContext('parent') ? getContext('parent') : null;
const depth = hasContext('depth') ? (getContext('depth') + 1) : 0;
const module = writable({});
setContext('depth', depth);
setContext('module', module);

const children = writable([]);
const siblings = parent ? parent.children : writable([]);

$: isColumn = type === "column";
$: isRow = !isColumn;
let isRoot = parent === null;

let style = "";

function createComponent({
	id,
	parent = null,
	root = false,
	node = null,
	depth,
	size = 1,
	minimized = false,
	type,
	children = [],
}) {
	return {
		id,
		root,
		node,
		depth,
		size,
		minimized,
		parent: parent ? parent.id : null,
		type,
		children,
	};
}

let current = createComponent({
	id: !isNaN(tree.id) ? tree.id : ID++,
	root: isRoot,
	depth,
	size,
	parent,
	type,
});

const context = {
	id: current.id,
	children,
	registerChild: (child) => {
		$children = [...$children, child];

		onDestroy(() => {
			$children = $children.filter((c) => c !== child);
		});
	}
};

setContext('parent', context);

if (parent) {
	parent.registerChild(current);
}

$layout.registerChild(current, () => $children);

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

		style = `${property}:${value}`;
	}
}

function addColumn() {
	const isNewChild = type === "row";

	const newborn = createComponent({
		id: ID + 1,
		parent: isNewChild ? context : parent,
		depth: isNewChild ? (depth + 1) : depth,
		type: isNewChild ? "column" : type,
		children: [
			{ type: "module"},
		]
	});

	if (isNewChild && $children.length === 1 && $children[0].type === "module") {
		replaceChildren(current, [
			createComponent({
				id: ID + 2,
				type: isNewChild ? "column" : "row",
				depth,
				children: [
					$children[0],
				]
			}),
			newborn
		]);
		// addChild(newborn, )
		// $children = [
		// 	createComponent({
		// 		id: ID + 2,
		// 		type: isNewChild ? "column" : "row",
		// 		depth,
		// 		children: [
		// 			$children[0],
		// 		]
		// 	}),
		// 	newborn,
		// ];

		module.set({});
	} else {
		console.log("add sibling");
		addSibling(current, newborn);
		// $siblings = [
		// 	...$siblings,
		// 	newborn,
		// ];
	}
}

function addRow() {

}

function handleModuleChange(event) {
	$children = [{
		...$children[0],
		name: event.detail
	}];
}

</script>

<div class:column={isColumn} class:root={isRoot} class:row={isRow} bind:this={current.node} class:minimized={current.minimized} style={style}>
	{#if tree && Array.isArray(tree.children) && tree.children.length > 0 }
		{#each tree.children as child }
			{#if child.type === "column" || child.type === "row"}
				<svelte:self type={child.type} size={child.size} tree={child} />
			{:else if child.type === "module"}
				<ModuleRendererNew name={child.name} />
			{/if}

		{/each}
	{:else}
		<slot></slot>
	{/if}
	{#if $currentLayout.editing && $children.length === 1 && $children[0].type === "module"}
	<div class="toolbar">
		<div class="toolbar__content">
			<Field key="module" value={$children[0].name} params={{options: ["Select a module", ...moduleNames] }} on:change={handleModuleChange} />
			<Field key="column" value={() => addColumn()} params={{ label: "add"}} />
			<Field key="row" value={addRow} params={{ label: "add"}} />
		</div>
	</div>
	{/if}
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

.column:not(:last-child) {
    border-right: 0.5px solid var(--color-lightblack);
}

.column:not(:first-child) {
    border-left: 0.5px solid var(--color-lightblack);
}

.row {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(25px, 1fr);
    width: 100%;
    height: 100%;

    background-color: var(--color-background);
}

.row:not(:first-child) {
	border-top: 0.5px solid var(--color-lightblack);
}

.row:not(:last-child) {
	border-bottom: 0.5px solid var(--color-lightblack);
}

.toolbar {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 2;

	display: grid;
	place-items: center;
	
	width: 100%;
	height: 100%;
	
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(8px);
	
}

.toolbar__content {
	width: 200px;

	border-radius: var(--border-radius-input); 
	background-color: var(--color-background);
}
</style>
