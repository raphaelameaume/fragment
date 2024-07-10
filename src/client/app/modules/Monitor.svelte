<script>
	import Module from '../ui/Module.svelte';
	import SketchRenderer from '../ui/SketchRenderer.svelte';
	import OutputRenderer from '../ui/OutputRenderer.svelte';
	import SketchSelect from '../ui/SketchSelect.svelte';
	import { monitors } from '../stores/rendering';
	import { getMonitorID } from '../state/monitors.svelte';
	import { sketchesManager } from '../state/sketches.svelte';

	let { id, hasHeader = true, sketchKey = null, } = $props();

	let key = $derived(sketchesManager.keys[0]);
	let index = $derived(monitors.findIndex((monitor) => monitor.id === id));
	let name = $derived(`Monitor ${$monitors.length > 1 ? index + 1 : ''}`.trim());
</script>

{#snippet headerLeft()}
	<SketchSelect monitorID={id} selected={key} />
{/snippet}

<Module {id} {hasHeader} slug="monitor" {name} scrollable={false} {headerLeft}>
	<!-- {#if selected && selected !== 'output'} -->
		<SketchRenderer {key} {id} />
	<!-- {:else if selected}
		<OutputRenderer />
	{/if} -->
</Module>
