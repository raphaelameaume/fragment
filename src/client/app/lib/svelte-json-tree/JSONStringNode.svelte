<script>
	import { useState } from './utils.js';

	let { value } = $props();

	const map = {
		'\n': '\\n',
		'\t': '\\t',
		'\r': '\\r',
	};

	let serialised = $derived(value.replace(/[\n\t\r]/g, (_) => map[_]));

	const { displayMode } = useState();
</script>

{#if displayMode === 'summary'}
	<span
		>"{serialised.slice(0, 30) + (serialised.length > 30 ? '…' : '')}"</span
	>
{:else}
	<span>"{serialised}"</span>
{/if}

<style>
	span {
		color: var(--string-color);
		word-break: break-all;
		word-wrap: break-word;
	}
</style>
