<script context="module">
let ID = 0;
</script>

<script>
import { getContext, hasContext, onDestroy, setContext, onMount } from "svelte";
import { writable } from "svelte/store";
import { addChildren, addSibling, current as currentLayout, remove, replaceChildren, swapRoot, updateModule } from "../stores/layout";
import LayoutToolbar from "./LayoutToolbar.svelte";
import ModuleRendererNew  from "./ModuleRendererNew.svelte";

import ResizerNew from "./ResizerNew.svelte";


export let size = 1;
export let type = "column";
export let tree = { children: [] };

let layout = getContext('layout');
let parent = hasContext('parent') ? getContext('parent') : null;
let depth = hasContext('depth') ? (getContext('depth') + 1) : 0;
let module = writable({});
setContext('depth', depth);
setContext('module', module);

let isRoot = parent === null;
let children = writable([]);

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

$: isColumn = type === "column";
$: isRow = !isColumn;

onMount(() => {
	if (isRoot) {
		console.log(`Root mounted`, current.id);
	}
})

const context = {
	id: current.id,
	children,
	getID: () => ID++,
	registerChild: (child) => {
		$children = [...$children, child];

		onDestroy(() => {
			$children = $children.filter((c) => c.id !== child.id);
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

	const nodes = tree.children;

	if (Array.isArray(nodes) && nodes.length > 1) {
		if (isColumn) {
			property = `grid-template-rows`;
			value = nodes.map((row, i) => {
				let size = `${row.size}fr`;

				return `minmax(25px, ${size}) 0px`;
			}).join(' ');
		} else {
			property = `grid-template-columns`;
			value = nodes.map((col, i) => {
				let size = `${col.size}fr`;

				return `minmax(25px, ${size}) 0px`;
			}).join(' ');
		}

		style = `${property}:${value}`;
	} else {
		style = "";
	}
}

function addComponent(newType) {
	const isSibling = newType === type;

	const newborn = createComponent({
		id: ID++,
		parent: isSibling ? parent : context,
		depth: isSibling ? depth : depth + 1,
		type: newType,
		children: [
			{ id: ID++, type: "module" },
		]
	});

	if (isSibling) {
		if (isRoot) {
			const newRoot = createComponent({
				id: ID++,
				depth,
				type: newType === "column" ? "row" : "column",
				root: true,
				children: [
					current,
					newborn,
				]
			});

			swapRoot(current, newborn, newRoot);
		} else {
			addSibling(current, newborn);
		}
	} else {
		if ($children.length === 1 && $children[0].type === "module") {
			replaceChildren(current, [
				...$children.map((c, i) => createComponent({
					id: ID++,
					type: type === "row" ? "column" : "row",
					depth: depth + 1,
					children: [
						c,
					]
				})),
				newborn
			]);

			module.set({});
		} else {
			addChildren(current, newborn);
		}
	}
}

function addColumn() {
	addComponent('column');
}

function addRow() {
	addComponent("row");
}

function deleteCurrent() {
	remove(current, () => ({
		id: ID++,
		type: "module",
	}));

	$children = current.children;
}

function handleModuleChange(event) {
	$children[0].name = event.detail; // keep state when replacingChildren
	updateModule($module, {
		name: event.detail,
	});
}

</script>

<div class:column={isColumn} class:root={isRoot} class:row={isRow} bind:this={current.node} class:minimized={current.minimized} style={style}>
	{#if tree && Array.isArray(tree.children) && tree.children.length > 0 }
		{#each tree.children as child (child.id) }
			{#if child.type === "column" || child.type === "row"}
				<svelte:self type={child.type} size={child.size} tree={child} />
			{:else if child.type === "module"}
				<ModuleRendererNew name={child.name} id={child.id} />
			{/if}

		{/each}
	{:else}
		<slot></slot>
	{/if}
	{#if $currentLayout.editing && (($children.length === 1 && $children[0].type === "module") || isRoot) }
	<LayoutToolbar
		{isRoot}
		moduleName={$children[0].name}
		on:change={handleModuleChange}
		on:add-row={addRow}
		on:add-column={addColumn}
		on:delete={deleteCurrent}
	/>
	{/if}
</div>
{#if !isRoot }
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
</style>
