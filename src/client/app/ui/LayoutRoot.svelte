<script>
	import { layout } from '../state/layout.svelte';
	import LayoutComponent from './LayoutComponent.svelte';

	let { children } = $props();
</script>

<LayoutComponent>
	{@render children()}
</LayoutComponent>
