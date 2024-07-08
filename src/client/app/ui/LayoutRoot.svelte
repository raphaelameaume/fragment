<script>
	import { layout } from '../state/layout.svelte';
	import LayoutComponent from './LayoutComponent.svelte';

	let { children } = $props();
	
	let type = $derived(layout.current.type);
	let size = $derived(layout.current.size);

	$inspect(layout.current);
</script>

<LayoutComponent tree={layout.current} {type} {size}>
	{@render children()}
</LayoutComponent>
