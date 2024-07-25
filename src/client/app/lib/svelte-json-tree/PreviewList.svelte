<script>
	import { useState } from './utils.js';

	let {
		list,
		label = undefined,
		prefix = undefined,
		postfix = undefined,
		root = false,
		item,
	} = $props();

	const { showPreview } = useState();
</script>

{#if root || showPreview}
	{#if prefix}{#if label}<span class="label">{label}</span>{/if}<span
			class="operator">{prefix}</span
		>{/if}
	{#each list as node, index}
		{@render item(node)}
		{#if index < list.length - 1}
			<span class="comma operator">,</span>
		{/if}
	{/each}
	{#if hasMore}
		<span class="comma operator">,</span>
		<span class="operator">…</span>
	{/if}
	{#if postfix}<span class="operator">{postfix}</span>{/if}
{/if}

<style>
	.comma {
		margin-left: -0.5em;
		margin-right: 0.5em;
	}
</style>
