<script>
	import { useState } from './utils';

	let {
		expandable: _expandable,
		expanded: _expanded,
		toggleExpand,
	} = useState();
	let { expanded = _expanded, expandable = _expandable } = $props();
</script>

{#if expandable}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<span class="json-arrow" class:expanded>
		<span class="char">{'\u25B6'}</span>
	</span>
{/if}

<style>
	.json-arrow {
		display: inline-flex;
		transition: 150ms;
		line-height: 1.1em;

		transform-origin: 2px 50%;
	}

	.json-arrow.expanded {
		transform: rotateZ(90deg);
	}

	.char {
		transform-origin: 25% 50%;
		position: relative;
		font-size: 0.75em;
		margin-left: 0;
		color: var(--arrow-color);
		user-select: none;
		font-family: 'Courier New', Courier, monospace;
		display: block;
		margin-top: 1px;
	}

	/* .expanded {
		transform: rotateZ(90deg) translateX(-3px);
	} */
</style>
