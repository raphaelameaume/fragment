<script>
	import JSONArrow from './JSONArrow.svelte';
	import JSONNested from './JSONNested.svelte';
	import JSONNode from './JSONNode.svelte';
	import PreviewList from './PreviewList.svelte';

	let { value } = $props();

	let keys = $derived(Object.getOwnPropertyNames(value));
	let previewList = $derived(value.slice(0, 5));
</script>

<JSONNested {keys}>
	{#snippet summary()}
		<span class="label">Array({value.length})</span>
	{/snippet}

	{#snippet preview(root)}
		<PreviewList
			list={previewList}
			hasMore={previewList.length < value.length}
			label="({value.length}) "
			prefix="["
			postfix="]"
			{root}
		>
			{#snippet item(node)}
				<JSONNode value={node} />
			{/snippet}
		</PreviewList>
	{/snippet}
	{#snippet itemKey(key)}
		<span class="property">{String(key)}</span>
	{/snippet}
	{#snippet itemValue(key)}
		<JSONNode value={value[key]} />
	{/snippet}
</JSONNested>
