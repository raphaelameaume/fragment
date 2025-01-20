<script>
	import LayoutComponent from './LayoutComponent.svelte';

	let { size = 1, children } = $props();
</script>

<LayoutComponent {size} type="column">
	{@render children?.()}
</LayoutComponent>
