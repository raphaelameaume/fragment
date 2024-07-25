<script>
	import { useState } from './utils.js';
	import JSONNested from './JSONNested.svelte';
	import JSONNode from './JSONNode.svelte';
	import PreviewList from './PreviewList.svelte';

	let { value } = $props();
	useState();

	let [indexes, keys, values] = $derived.by(() => {
		let _indexes = [];
		let _keys = [];
		let _values = [];
		let i = 0;
		for (const entry of value) {
			_indexes.push(i++);
			_keys.push(entry[0]);
			_values.push(entry[1]);
		}

		return [_indexes, _keys, _values];
	});

	let previewKeys = $derived(Array.from(value.keys()).slice(0, 5));

	const ENTRIES = '[[Entries]]';
</script>

<JSONNested keys={[ENTRIES, 'size']} shouldShowColon={(key) => key !== ENTRIES}>
	{#snippet summary()}
		<span color="label">Map({keys.length})</span>
	{/snippet}
	{#snippet preview(root)}
		<PreviewList
			list={previewKeys}
			hasMore={previewKeys.length < value.size}
			label={`Map(${keys.length}) `}
			prefix={`{`}
			postfix="}"
			{root}
		>
			{#snippet item(key)}
				<JSONNode value={key} /><span class="operator">{' => '}</span
				><JSONNode value={value.get(key)} />
			{/snippet}
		</PreviewList>
	{/snippet}
	{#snippet itemKey(key)}
		<span class={key === ENTRIES ? 'internal' : 'property'}>{key}</span>
	{/snippet}
	{#snippet itemValue(key)}
		{#if key === ENTRIES}
			<JSONNested
				keys={indexes}
				expandKey={(index) => keys[index]}
				defaultExpanded
			>
				{#snippet itemKey(index)}
					<span class="property">{index}</span>
				{/snippet}
				{#snippet itemValue(index)}
					<JSONNested keys={['key', 'value']}>
						{#snippet preview()}
							<span class="operator">{'{ '}</span><JSONNode
								value={keys[index]}
							/><span class="operator">{' => '}</span><JSONNode
								value={values[index]}
							/><span class="operator">{' }'}</span>
						{/snippet}
						{#snippet itemKey(name)}
							<span class="property">{name}</span>
						{/snippet}
						{#snippet itemValue(name)}
							<JSONNode
								value={name === 'key'
									? keys[index]
									: values[index]}
							/>
						{/snippet}
					</JSONNested>
				{/snippet}
			</JSONNested>
		{:else}
			<JSONNode value={value[key]} />
		{/if}
	{/snippet}
</JSONNested>
