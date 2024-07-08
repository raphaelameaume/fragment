<script context="module">
	
</script>

<script>
	import { getContext, hasContext, onDestroy, onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import {
		layout,
	} from '../state/layout.svelte';
	import Toolbar from './LayoutToolbar.svelte';
	import Resizer from './LayoutResizer.svelte';
	import ModuleRenderer from './ModuleRenderer.svelte';
	import Preview from './Preview.svelte';

	let { size = 1, type = 'column', tree = { children: [] }, children } = $props();

	let parent = hasContext('parent') ? getContext('parent') : null;
	let depth = hasContext('depth') ? getContext('depth') + 1 : 0;
	let isColumn = $derived(type === 'column');
	let isRow = $derived(!isColumn);

	let current = $state(layout.createComponent({
		id: tree.id,
		depth,
		size,
		parent,
		type,
	}));
	let isRoot = $derived(current.root);
	// let children = $derived(current.children);
	let property = $derived(isColumn ? `grid-template-rows` : `grid-template-columns`);
	let value = $derived(current.children
		.map(({ size }) => `minmax(25px, ${size}fr) 0px`)
		.join(' '));
	let style = $derived(Array.isArray(current.children) && current.children.length > 1 ? `${property}:${value}` : '');

	setContext('parent', current);
	setContext('depth', depth);

	if (!__BUILD__ && isRoot) {
		layout.current = current;
	}

	if (parent) {
		parent.registerChild(current);
	}

	onMount(() => {
		return () => {
			layout.remove(current);
		}
	})

	function addComponent(newType) {
		const isSibling = newType === type;
		console.log('addComponent', type, isSibling);

		const newborn = layout.createComponent({
			parent: isSibling ? parent : current,
			depth: isSibling ? depth : depth + 1,
			type: newType,
		});
	
		newborn.children.push(layout.createComponent({
			parent: newborn,
			type: 'module',
			root: false,
			depth: newborn.depth + 1,
		}))

		if (isSibling) {
			if (current.root) {
				const newSibling = layout.createComponent({
					depth: newborn.depth,
					type: newborn.type,
					children: current.children,
					parent: current,
					root: false,
				});

				// switch type
				current.children = [newSibling, newborn];
				current.type = current.type === 'column' ? 'row' : 'column';

				layout.swapRoot(current);
			} else {
				console.log('addSibling', newborn);
				layout.addSibling(current, newborn);
			}
		} else {
			if (current.children.length === 1 && current.children[0].type === 'module') {
				layout.replaceChildren(current, [
					...current.children.map((c, i) => {
						const middle = layout.createComponent({
							type: type === 'row' ? 'column' : 'row',
							depth: depth + 1,
							root: false,
						});
						middle.children.push(c);

						return middle;
					}),
					newborn,
				]);
			} else {
				console.log('addChild', newborn);
				layout.addChild(current, newborn);
			}
		}
	}

	function addColumn() {
		addComponent('column');
	}

	function addRow() {
		addComponent('row');
	}

	function deleteCurrent() {
		layout.remove(current);
	}

	function handleModuleChange(moduleName) {
		current.children[0].name = moduleName; // keep state when replacingChildren
	}

	let offsetWidth;
	let minimized = $derived(current.minimized);
</script>

<div
	{style}
	class:column={isColumn}
	class:root={isRoot}
	class:row={isRow}
	class:minimized
	bind:this={current.node}
	bind:offsetWidth
>
	{#if isRoot && layout.previewing}
		<Preview />
	{:else if tree && Array.isArray(tree.children) && tree.children.length > 0}
		{#each tree.children as child (child.id)}
			{#if child.type === 'column' || child.type === 'row'}
				<svelte:self type={child.type} size={child.size} tree={child} />
			{:else if child.type === 'module'}
				<ModuleRenderer
					name={child.name}
					hasHeader={child.hasHeader}
				/>
			{/if}
		{/each}
	{:else}
		{@render children()}
	{/if}
	{#if layout.editing && ((current.children.length === 1 && current.children[0].type === 'module') || isRoot)}
		<Toolbar
			{isRoot}
			moduleName={current.children[0]?.name}
			onchange={handleModuleChange}
			onAddRow={addRow}
			onAddColumn={addColumn}
			onDelete={deleteCurrent}
			vertical={offsetWidth < 300}
		/>
	{/if}
</div>
{#if !isRoot}
	<Resizer
		direction={isColumn ? 'vertical' : 'horizontal'}
		{current}
		{parent}
	/>
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
