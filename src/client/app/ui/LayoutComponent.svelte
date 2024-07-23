<script context="module">
</script>

<script>
	import {
		tick,
		getContext,
		hasContext,
		onDestroy,
		onMount,
		setContext,
	} from 'svelte';
	import { writable } from 'svelte/store';
	import { layout } from '../state/layout.svelte';
	import Toolbar from './LayoutToolbar.svelte';
	import Resizer from './LayoutResizer.svelte';
	import ModuleRenderer from './ModuleRenderer.svelte';
	import Preview from './Preview.svelte';

	let { id, size = 1, type = 'column', tree, children } = $props();

	let parent = hasContext('parent') ? getContext('parent') : null;
	let depth = hasContext('depth') ? getContext('depth') + 1 : 0;
	let isColumn = $derived(type === 'column');
	let isRow = $derived(!isColumn);

	let current = layout.createComponent({
		id,
		depth,
		size,
		origin: parent,
		type,
	});

	let minimized = $derived(current.minimized);

	$effect(() => {
		layout.persist({
			id: current.id,
			size: current.size,
			name: current.children[0]?.name,
			minimized: current.minimized,
		});
		// }
	});

	let isRoot = $derived(current.root);

	let property = $derived(
		isColumn ? `grid-template-rows` : `grid-template-columns`,
	);
	let nodes = $derived(tree ?? current.children);
	let value = $derived.by(() => {
		const totalSize = nodes.reduce((t, n) => t + n.size, 0);
		return nodes
			.map(({ size, minimized }) =>
				minimized && isColumn && !layout.editing
					? '25px 0px'
					: `minmax(25px, ${(size / totalSize) * 100}%) 0px`,
			)
			.join(' ');
	});
	let style = $derived(
		Array.isArray(nodes) && nodes.length > 0 ? `${property}:${value}` : '',
	);

	setContext('parent', current);
	setContext('depth', depth);

	onMount(() => {
		// this is what makes the whole layout rerender after setup
		// onMount of <LayoutRoot> is trigger the last, so by this time, every child component has registered himself into the layout tree
		if (current.root) {
			// avoid mount of module on boot
			setTimeout(() => {
				layout.tree = current;
			}, 16);
		}
	});

	function addComponent(newType) {
		const childCount = current.children.length;

		layout.createComponent({
			origin: current,
			type: newType,
		});

		// create a second child of new type to create divisions
		// instead of a single child component which wouldn't make any visual change
		if (childCount === 0 && newType !== current.type) {
			layout.createComponent({
				origin: current,
				type: newType,
			});
		}
	}

	const addColumn = () => addComponent('column');
	const addRow = () => addComponent('row');

	function deleteCurrent() {
		layout.remove(current);
	}

	function handleModuleChange(moduleName) {
		if (current.children.length && current.children[0].type === 'module') {
			current.children[0].name = moduleName; // keep state when replacingChildren
		} else {
			layout.createComponent({
				type: 'module',
				origin: current,
				name: moduleName,
			});
		}
	}
</script>

<div
	{style}
	class:column={isColumn}
	class:root={isRoot}
	class:row={isRow}
	class:minimized
	bind:this={current.node}
>
	{#if isRoot && layout.previewing}
		<Preview />
	{:else if tree && tree.length > 0}
		{#each tree as child (child.id)}
			{#if child.type === 'column' || child.type === 'row'}
				<svelte:self
					id={child.id}
					type={child.type}
					size={child.size}
					tree={child.children}
				/>
			{:else if child.type === 'module'}
				<ModuleRenderer
					id={child.id}
					name={child.name}
					hasHeader={child.hasHeader}
					isDynamic={true}
				/>
			{:else}
				<p>Cannot render child</p>
			{/if}
		{/each}
	{:else}
		{@render children()}
	{/if}
	{#if layout.editing && ((current.children.length === 1 && current.children[0].type === 'module') || isRoot || current.children.length === 0)}
		<Toolbar
			{isRoot}
			moduleName={current.children[0]?.name}
			onchange={handleModuleChange}
			onAddRow={addRow}
			onAddColumn={addColumn}
			onDelete={deleteCurrent}
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

	.column.minimized {
		height: 25px;
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
