<script>
	import LayoutComponent from './LayoutComponent.svelte';

	let { size = 1, children } = $props();
</script>

<LayoutComponent {size} type="row">
	{@render children?.()}
</LayoutComponent>
