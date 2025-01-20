<script>
	import JSONNested from './JSONNested.svelte';
	import JSONNode from './JSONNode.svelte';
	import PreviewList from './PreviewList.svelte';

	let { value, nodeType } = $props();

	const TO_STRING_TAG = 'Symbol(Symbol.toStringTag)';
	const internalKeys = [
		'buffer',
		'byteLength',
		'byteOffset',
		'length',
		TO_STRING_TAG,
	];
	let keys = $derived([
		...Object.getOwnPropertyNames(value),
		...internalKeys,
	]);
	let previewList = $derived(value.slice(0, 5));

	function getValue(key) {
		if (key === TO_STRING_TAG) {
			return value[Symbol.toStringTag];
		}
		return value[key];
	}
</script>

<JSONNested {keys}>
	{#snippet summary()}
		<span class="label">{nodeType}({value.length})</span>
	{/snippet}
	{#snippet preview(root)}
		<PreviewList
			list={previewList}
			hasMore={previewList.length < value.length}
			label="{nodeType}({value.length}) "
			prefix="["
			postfix="]"
			{root}
		>
			{#snippet item(value)}
				<JSONNode {value} />
			{/snippet}
		</PreviewList>
	{/snippet}
	{#snippet itemKey(key)}
		<span class={internalKeys.includes(key) ? 'internal' : 'property'}
			>{String(key)}</span
		>
	{/snippet}
	{#snippet itemValue(key)}
		<JSONNode value={getValue(key)} />
	{/snippet}
</JSONNested>
