<script>
import { getContext, onMount, onDestroy, afterUpdate } from "svelte";

export let label;

let item = {
	label,
};

let { tabIndex, tabs, registerTab } = getContext('tabs');

registerTab(item);

</script>

{#if $tabIndex === $tabs.indexOf(item)}
<slot></slot>
{/if}
