<script>
	import JSONNested from './JSONNested.svelte';
	import JSONNode from './JSONNode.svelte';
	import PreviewList from './PreviewList.svelte';

	let { value, nodeType } = $props();

	let [indexes, items] = $derived.by(() => {
		let _indexes = [];
		let _items = [];
		let i = 0;
		for (const entry of value) {
			_indexes.push(i++);
			_items.push(entry);
		}

		return [_indexes, _items];
	});

	let previewItems = $derived(items.slice(0, 5));

	const ENTRIES = '[[Entries]]';
</script>

<JSONNested keys={[ENTRIES, 'size']} shouldShowColon={(key) => key !== ENTRIES}>
	{#snippet summary()}
		<span class="label">{nodeType}({indexes.length})</span>
	{/snippet}
	{#snippet preview(root)}
		<PreviewList
			list={previewItems}
			hasMore={previewItems.length < items.length}
			label={`${nodeType}(${indexes.length}) `}
			prefix={'{'}
			postfix="}"
			{root}
		>
			{#snippet item(value)}
				<JSONNode {value} />
			{/snippet}
		</PreviewList>
	{/snippet}
	{#snippet itemKey(key)}
		<span class={key === ENTRIES ? 'internal' : 'property'}>{key}</span>
	{/snippet}
	{#snippet itemValue(key)}
		{#if key === ENTRIES}
			<JSONNested keys={indexes} defaultExpanded>
				{#snippet itemKey(index)}
					<span class="property">{index}</span>
				{/snippet}
				{#snippet itemValue(index)}
					<JSONNode value={items[index]} />
				{/snippet}
			</JSONNested>
		{:else}
			<JSONNode value={value[key]} />
		{/if}
	{/snippet}
</JSONNested>
