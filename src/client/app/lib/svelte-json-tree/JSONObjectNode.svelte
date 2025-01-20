<script>
	import JSONNested from './JSONNested.svelte';
	import JSONNode from './JSONNode.svelte';
	import PreviewList from './PreviewList.svelte';

	let { value, summary: summaryText } = $props();

	let keys = $derived(Object.getOwnPropertyNames(value));
	let previewKeys = $derived(keys.slice(0, 5));
</script>

<JSONNested {keys}>
	{#snippet summary()}
		<span class="label">{summaryText ?? '{…}'}</span>
	{/snippet}

	{#snippet preview(root)}
		<PreviewList
			list={previewKeys}
			hasMore={previewKeys.length < keys.length}
			prefix={summaryText ? `${summaryText} {` : '{ '}
			postfix={' }'}
			{root}
		>
			{#snippet item(key)}
				<span class="property">{key}</span>
				<span class="operator">{': '}</span>
				<JSONNode value={value[key]} />
			{/snippet}
		</PreviewList>
	{/snippet}

	{#snippet itemKey(key)}
		<span class="property">{key}</span>
	{/snippet}

	{#snippet itemValue(key)}
		<JSONNode value={value[key]} />
	{/snippet}
</JSONNested>
