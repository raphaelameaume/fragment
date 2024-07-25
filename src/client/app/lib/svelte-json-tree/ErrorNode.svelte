<script>
	import ErrorStack from './ErrorStack.svelte';
	import JSONNested from './JSONNested.svelte';
	import JSONNode from './JSONNode.svelte';

	let { value } = $props();

	let stack = $derived(value.stack.split('\n'));
</script>

<JSONNested keys={['message', 'stack']}>
	{#snippet summary()}
		<span class="label">Error: {String(value.message)}</span>
	{/snippet}
	{#snippet preview()}
		<span class="label">Error: {String(value.message)}</span>
	{/snippet}
	{#snippet itemKey(key)}
		<span class="property">{key}</span>
	{/snippet}
	{#snippet itemValue(key)}
		{#if key === 'stack'}
			<ErrorStack {stack} />
		{:else}
			<JSONNode value={value[key]} />
		{/if}
	{/snippet}
</JSONNested>
