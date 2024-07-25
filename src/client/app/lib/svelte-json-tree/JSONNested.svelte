<script>
	/* eslint-disable @typescript-eslint/no-empty-function */
	import { onMount } from 'svelte';
	import JSONArrow from './JSONArrow.svelte';
	import { useState } from './utils.js';
	import { writable } from 'svelte/store';
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

	const {
		isParentExpanded,
		displayMode,
		root,
		expanded,
		expandable,
		keyPath,
		level,
		shouldExpandNode,
	} = useState({ root: false }, { expandable: true });
	$expandable = true;

	if (displayMode !== 'summary') {
		// if not internally control to open
		if (!defaultExpanded) {
			const controlled = shouldExpandNode({ keyPath, level });
			if (controlled !== undefined) {
				defaultExpanded = controlled;
			}
		}

		onMount(() => {
			return isParentExpanded.subscribe((value) => {
				if (!value) expanded.set(false);
				else expanded.set(defaultExpanded);
			});
		});
	}
	function toggleExpand() {
		$expanded = !$expanded;
	}

	let child_expanded = $derived(keys.map(() => writable(false)));
</script>

{#if displayMode === 'summary'}
	{@render summary()}
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<span class="root" onclick={(e) => toggleExpand(e)}>
		{#if root}
			<JSONArrow {expanded} />
		{/if}
		<Summary>
			{@render preview(root)}
		</Summary>
	</span>

	{#if $expanded}
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
		<ul
			onclick={(e) => {
				e.stopPropagation();
				toggleExpand(e);
			}}
		>
			{#each keys as key, index}
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<li
					class:indent={$expanded}
					onclick={(e) => {
						e.stopPropagation();
					}}
				>
					<Expandable
						key={expandKey(key)}
						expanded={child_expanded[index]}
					>
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<span
							class="label"
							onclick={() =>
								child_expanded[index].update((value) => !value)}
						>
							<JSONArrow />
							{@render itemKey(key)}
							{#if !shouldShowColon || shouldShowColon(key)}<span
									class="operator">{': '}</span
								>{/if}
						</span>{@render itemValue(key)}
					</Expandable>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	.root {
		display: inline-block;
		position: relative;
	}
	.indent {
		padding-left: var(--li-identation);
	}
	.label {
		position: relative;
	}
</style>
