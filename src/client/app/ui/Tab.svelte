<script>
import { getContext, onMount, onDestroy, afterUpdate } from "svelte";

export let label;

let tabs = getContext('tabs');
let tabIndex = getContext('tabIndex');

let current = {};

onMount(() => {
	current.label = label;
	$tabs = [...$tabs, current];
});

afterUpdate(() => {
	const temp = [...$tabs];
	const index = temp.indexOf(current);
	current.label = label;
	temp[index] = current;

	$tabs = temp;
})

onDestroy(() => {
	$tabs = $tabs.filter((tab) => tab !== current);
});
</script>

{#if $tabIndex === $tabs.indexOf(current)}
<div class="tab-content">
	<slot></slot>
</div>
{/if}
