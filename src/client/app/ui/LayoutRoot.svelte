<script>
	import LayoutComponent from './LayoutComponent.svelte';

	let { children } = $props();
</script>

<LayoutComponent>
	{@render children?.()}
</LayoutComponent>
