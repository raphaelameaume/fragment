<script>
	import Module from '../ui/Module.svelte';
	import SketchRenderer from '../ui/SketchRenderer.svelte';
	import OutputRenderer from '../ui/OutputRenderer.svelte';
	import SketchSelect from '../ui/SketchSelect.svelte';
	import { monitors } from '../stores/rendering';
	import { getMonitorID } from '../state/monitors.svelte';
	import { sketchesKeys } from '../state/sketches.svelte';

	let { mID, hasHeader = true, sketchKey = null } = $props();

	let id = getMonitorID();
	let selected = $derived(sketchKey ?? sketchesKeys[0]);
	let index = $derived(monitors.findIndex((monitor) => monitor.id === id));
	let moduleName = $derived(`${name} ${$monitors.length > 1 ? index + 1 : ''}`);
</script>

<Module {hasHeader} slug="monitor" name={moduleName} scrollable={false}>
	<svelte:fragment slot="header-left">
		<SketchSelect monitorID={id} {selected} />
	</svelte:fragment>
	{#if selected && selected !== 'output'}
		<SketchRenderer key={selected} {id} />
	{:else if selected}
		<OutputRenderer />
	{/if}
</Module>
