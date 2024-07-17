<script>
	import Module from '../ui/Module.svelte';
	import SketchRenderer from '../ui/SketchRenderer.svelte';
	import OutputRenderer from '../ui/OutputRenderer.svelte';
	import SketchSelect from '../ui/SketchSelect.svelte';
	import { monitors } from '../stores/rendering';
	import { getMonitorID } from '../state/monitors.svelte';
	import { sketchesManager } from '../state/sketches.svelte';
	import ErrorOverlay from '../ui/ErrorOverlay.svelte';
	import { errors } from '../state/errors.svelte.js';

	let { id, hasHeader = true, sketchKey = null, } = $props();

	let key = $derived(sketchesManager.keys[0]);
	let index = $derived(monitors.findIndex((monitor) => monitor.id === id));
	let name = $derived(`Monitor ${$monitors.length > 1 ? index + 1 : ''}`.trim());

	let error = $derived(
		errors.has(key)
			? errors.get(key) : errors.values().next().value); // display error if error context match current key
	
			// : errors.size === 1 &&
			// 	  ![...errors.keys()].some((key) =>
			// 			sketchesManager.keys.includes(key),
			// 	  ) &&
			// 	  ($monitors.length === 1 || // if there's only one monitor
			// 			!$monitors.some(
			// 				(m) => m.selected === errors.keys().next().value,
			// 			)) // if none of current monitors match the key
			// 	? errors.get(errors.keys().next().value)
			// 	: null);
</script>

{#snippet headerLeft()}
	<SketchSelect monitorID={id} selected={key} />
{/snippet}

<Module {id} {hasHeader} slug="monitor" {name} scrollable={false} {headerLeft}>
	<!-- {#if selected && selected !== 'output'} -->
	<SketchRenderer {key} {id} />
	{#if error}
		<ErrorOverlay {error} />
	{/if}
	<!-- {:else if selected}
		<OutputRenderer />
	{/if} -->
</Module>
