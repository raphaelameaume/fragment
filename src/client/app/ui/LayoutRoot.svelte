<script>
	import { layout } from '../state/layout.svelte';
	import LayoutComponent from './LayoutComponent.svelte';

	let { children } = $props();
	
	let type = $derived(layout.current.type);
	let size = $derived(layout.current.size);
	let tree = $derived(layout.current);

	$effect(() => {
		console.log('tree has changed', tree);
	});

</script>

<LayoutComponent {tree} {type} {size}>
	{#if !tree.children}
		{@render children()}
	{/if}
</LayoutComponent>
