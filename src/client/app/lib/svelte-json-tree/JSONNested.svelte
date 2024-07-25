<script>
	/* eslint-disable @typescript-eslint/no-empty-function */
	import { getContext, onMount, setContext } from 'svelte';
	import JSONArrow from './JSONArrow.svelte';
	import { useState } from './utils.js';
	import Summary from './Summary.svelte';
	import Expandable from './Expandable.svelte';

	let {
		keys,
		shouldShowColon = undefined,
		expandKey = (key) => key,
		defaultExpanded = false,
		summary,
		preview,
		itemKey,
		itemValue,
	} = $props();

	let expanded = $state(defaultExpanded);
	let expandable = $state(true);
	let displayMode = getContext('displayMode');
	let root = getContext('root');
	let toggleExpand = (e) => {
		e?.preventDefault();

		expanded = !expanded;
	};

	$effect(() => {
		setContext('expandable', expandable);
		setContext('expanded', expanded);
		setContext('toggleExpand', toggleExpand);
	});

	setContext('root', false);
</script>

{#if displayMode === 'summary'}
	{@render summary()}
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<span class="root" onclick={(e) => toggleExpand(e)}>
		{#if root}
			<JSONArrow {expanded} {expandable} />
		{/if}
		<Summary>
			{@render preview(root)}
		</Summary>
	</span>

	{#if expanded}
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
		<ul
			onclick={(e) => {
				e.stopPropagation();
				toggleExpand(e);
			}}
		>
			{#each keys as key, index}
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<li class:indent={expanded}>
					<Expandable key={expandKey(key)}>
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- child_expanded[index].update((value) => !value) -->
						<span class="label">
							<JSONArrow />
							{@render itemKey(key)}
							{#if !shouldShowColon || shouldShowColon(key)}
								<span class="operator">{': '}</span>
							{/if}
						</span>
						{@render itemValue(key)}
					</Expandable>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	.root {
		display: inline-flex;
		position: relative;
		flex-wrap: wrap;
		white-space: pre-wrap;
	}
	.indent {
		padding-left: var(--li-identation);
	}
	.label {
		position: relative;
		display: inline-flex;
	}
</style>
