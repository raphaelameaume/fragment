<script>
	import Module from '../ui/Module.svelte';
	import SketchRenderer from '../ui/SketchRenderer.svelte';
	import OutputRenderer from '../ui/OutputRenderer.svelte';
	import SketchSelect from '../ui/SketchSelect.svelte';
	import { monitors } from '../stores/rendering';
	import { getMonitorID } from '../state/monitors.svelte';
	import { sketchesKeys } from '../state/sketches.svelte';

	let { id, hasHeader = true, sketchKey = null, } = $props();

	console.log(`Monitor :: id`, id);

	// let id = getMonitorID();
	let selected = $derived(sketchKey ?? sketchesKeys[0]);
	let index = $derived(monitors.findIndex((monitor) => monitor.id === id));
	let name = $derived(`Monitor ${$monitors.length > 1 ? index + 1 : ''}`.trim());
</script>

{#snippet headerLeft()}
	<SketchSelect monitorID={id} {selected} />
{/snippet}

<Module {id} {hasHeader} slug="monitor" {name} scrollable={false} {headerLeft}>
	{#if selected && selected !== 'output'}
		<SketchRenderer key={selected} {id} />
	{:else if selected}
		<OutputRenderer />
	{/if}
</Module>
