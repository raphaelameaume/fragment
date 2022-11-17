<script>
import { getContext } from "svelte";

export let label = "Tab";
export let active = false;

let tab = { label, active };
let { tabIndex, tabs, registerTab, updateTab } = getContext('tabs');

registerTab(tab);

$: {
	if (label !== tab.label || active !== tab.active) {
		updateTab(tab, {
			label,
			active,
		});
	}
}

</script>

{#if $tabIndex === $tabs.indexOf(tab)}
<slot></slot>
{/if}
