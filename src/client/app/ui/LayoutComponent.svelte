<script>
	import { getContext, setContext } from 'svelte';
	import { layout } from '../state/layout.svelte';
	import Toolbar from './LayoutToolbar.svelte';
	import Resizer from './LayoutResizer.svelte';
	import ModuleRenderer from './ModuleRenderer.svelte';
	import Preview from '../components/Preview.svelte';
	import LayoutComponent from './LayoutComponent.svelte';

	let {
		id = layout.getID(),
		size = 1,
		type = 'column',
		children,
		resizable = true,
	} = $props();

	let parent = getContext('parent');
	let isColumn = $derived(type === 'column');
	let isRow = $derived(!isColumn);

	const component = layout.createComponent({
		id,
		size,
		origin: parent,
		type,
	});

	let current = $derived(layout.components.find((c) => c.id === id));
	let childComponents = $derived(
		current.children.map((c) => layout.getComponent(c)),
	);
	let minimized = $derived(current.minimized);
	let isRoot = $derived(current.root);

	setContext('parent', component.id);
	setContext('minimize', () => {
		component.minimized = !component.minimized;
	});

	let property = $derived(
		isColumn ? `grid-template-rows` : `grid-template-columns`,
	);
	let value = $derived.by(() => {
		const totalSize = childComponents.reduce((t, n) => t + n.size, 0);
		return childComponents
			.map(({ size, minimized }) =>
				minimized && isColumn && !layout.editing
					? '25px 0px'
					: `minmax(25px, ${(size / totalSize) * 100}%) 0px`,
			)
			.join(' ');
	});
	let style = $derived(
		Array.isArray(childComponents) && childComponents.length > 0
			? `${property}:${value}`
			: '',
	);

	function addComponent(newType) {
		const childCount = childComponents.length;

		layout.createComponent({
			origin: current.id,
			type: newType,
		});

		// create a second child of new type to create divisions
		// instead of a single child component which wouldn't make any visual change
		if (childCount === 0 && newType !== current.type) {
			layout.createComponent({
				origin: current.id,
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
		if (childComponents.length && childComponents[0].type === 'module') {
			childComponents[0].name = moduleName; // keep state when replacingChildren
		} else {
			layout.createComponent({
				type: 'module',
				origin: current.id,
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
	data-component={component.id}
>
	{#if isRoot && layout.previewing}
		<Preview />
	{:else if childComponents.length > 0 && layout.persistent}
		{#each childComponents as child (child.id)}
			{#if child.type === 'column' || child.type === 'row'}
				<LayoutComponent
					id={child.id}
					type={child.type}
					size={child.size}
				/>
			{:else if child.type === 'module'}
				<ModuleRenderer
					id={child.id}
					name={child.name}
					headless={child.headless}
					params={child.params}
				/>
			{:else}
				<p>Cannot render child</p>
			{/if}
		{/each}
	{:else}
		{@render children?.()}
	{/if}
	{#if layout.editing && (isRoot || (childComponents.length === 1 && childComponents[0].type === 'module') || childComponents.length === 0)}
		<Toolbar
			{isRoot}
			moduleName={childComponents[0]?.name}
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
		bind:current
		disabled={!resizable}
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
		border-right: 0.5px solid var(--fragment-color-lightblack);
	}

	.column:not(:first-child) {
		border-left: 0.5px solid var(--fragment-color-lightblack);
	}

	.row {
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: minmax(25px, 1fr);
		width: 100%;
		height: 100%;

		background-color: var(--fragment-background-color);
	}

	.row:not(:first-child) {
		border-top: 0.5px solid var(--fragment-color-lightblack);
	}

	.row:not(:last-child) {
		border-bottom: 0.5px solid var(--fragment-color-lightblack);
	}
</style>
