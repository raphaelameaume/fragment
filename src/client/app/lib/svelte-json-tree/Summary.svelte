<script>
	import { setContext } from 'svelte';

	let { children } = $props();

	setContext('displayMode', 'summary');
</script>

{@render children()}
