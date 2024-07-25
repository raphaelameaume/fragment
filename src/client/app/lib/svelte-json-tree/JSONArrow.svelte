<script>
	import { useState } from './utils.js';
	const { expanded: _expanded, expandable } = useState();

	let { expanded = _expanded } = $props();
</script>

{#if $expandable}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<span
		class="container"
		onclick={(event) => {
			event.stopPropagation();
			$expanded = !$expanded;
		}}
	>
		<span class="arrow" class:expanded={$expanded}>{'\u25B6'}</span>
	</span>
{/if}

<style>
	.container {
		display: inline-block;
		transform: translate(calc(0px - var(--li-identation)), -50%);
		position: absolute;
		top: 50%;
		padding-right: 100%;
	}
	.arrow {
		transform-origin: 25% 50%;
		position: relative;
		line-height: 1.1em;
		font-size: 0.75em;
		margin-left: 0;
		transition: 150ms;
		color: var(--arrow-color);
		user-select: none;
		font-family: 'Courier New', Courier, monospace;
		display: block;
	}
	.expanded {
		transform: rotateZ(90deg) translateX(-3px);
	}
</style>
