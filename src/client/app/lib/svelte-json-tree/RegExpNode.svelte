<script>
	import JSONNested from './JSONNested.svelte';
	import JSONNode from './JSONNode.svelte';

	let { value } = $props();

	let str = $derived(value.toString());

	const keys = [
		'lastIndex',
		'dotAll',
		'flags',
		'global',
		'hasIndices',
		'ignoreCase',
		'multiline',
		'source',
		'sticky',
		'unicode',
	];
</script>

<JSONNested {keys}>
	{#snippet summary()}
		<span class="regex">{str}</span>
	{/snippet}
	{#snippet preview(root)}
		<span class="regex">{str}</span>
	{/snippet}
	{#snippet itemKey(key)}
		<span class="internal">{String(key)}</span>
	{/snippet}
	{#snippet itemValue(key)}
		<JSONNode value={value[key]} />
	{/snippet}
</JSONNested>

<style>
	.regex {
		color: var(--regex-color);
	}
</style>
