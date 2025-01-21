<script>
	import LayoutComponent from './LayoutComponent.svelte';

	let { size = 1, children, resizable = true } = $props();
</script>

<LayoutComponent type="column" {size} {resizable}>
	{@render children?.()}
</LayoutComponent>
