<script>
	import { layout } from '../state/layout.svelte';
	import LayoutComponent from './LayoutComponent.svelte';

	let { children } = $props();

	let tree = $derived(layout.tree);
</script>

<LayoutComponent tree={tree.children}>
	{#if !layout.tree.children}
		{@render children()}
	{/if}
</LayoutComponent>
