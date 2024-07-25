<script>
	import JsonNode from './JSONNode.svelte';
	import { useState } from './utils.js';

	let { stack } = $props();

	const { expanded, expandable, toggleExpand } = useState();
	//expandable = true;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y-no-static-element-interactions -->
<span onclick={(e) => toggleExpand(e)} role="button">
	{#if expanded}
		{#each stack as line, index}
			{@const appendNewLine = index < stack.length - 1}
			<span class:indent={index > 0}
				><JsonNode value={line + (appendNewLine ? '\\n' : '')} /><span
					class="operator">{appendNewLine ? ' +' : ''}</span
				></span
			><br />
		{/each}
	{:else}
		<span><JsonNode value={stack[0] + '…'} /></span>
	{/if}
</span>

<style>
	.indent {
		padding-left: var(--li-identation);
	}
</style>
