<script>
	import { useState } from './utils.js';

	let { children } = $props();

	useState({ displayMode: 'summary' });
</script>

{@render children()}
