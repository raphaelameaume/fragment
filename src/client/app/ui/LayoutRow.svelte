<script>
	import LayoutComponent from './LayoutComponent.svelte';

	let { size = 1, children, resizable = true } = $props();
</script>

<LayoutComponent type="row" {size} {resizable}>
	{@render children?.()}
</LayoutComponent>
