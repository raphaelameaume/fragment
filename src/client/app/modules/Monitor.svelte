<script>
	import Module from '../ui/Module.svelte';
	import SketchRenderer from '../ui/SketchRenderer.svelte';
	import OutputRenderer from '../ui/OutputRenderer.svelte';
	import SketchSelect from '../ui/SketchSelect.svelte';
	import { monitors } from '../state/monitors.svelte';
	import { sketchesManager } from '../state/sketches.svelte';
	import ErrorOverlay from '../ui/ErrorOverlay.svelte';
	import { errors } from '../state/errors.svelte.js';
	import { onMount } from 'svelte';
	import { layout } from '../state/layout.svelte';
	import { rendering, SIZES } from '../state/rendering.svelte.js';

	let { id = layout.getID(), headless = false, sketchKey = null } = $props();

	let key = $derived(sketchesManager.keys[0]);
	let index = $derived(monitors.all.findIndex((m) => m.id === id));
	let name = $derived(
		`Monitor ${monitors.all.length > 1 ? index + 1 : ''}`.trim(),
	);

	// display error if error context match current key
	// or if an error doesn't match any params from monitor
	let error = $derived(
		errors.has(key)
			? errors.get(key)
			: monitors.all.length === 1 ||
				  !monitors.all.some(
						(m) => m.selected === errors.keys().next().value,
				  )
				? errors.values().next().value
				: null,
	);

	let dimensions = $state({
		width: undefined,
		height: undefined,
	});
	let node;

	function checkForResize(resizing, { width, height }) {
		if (isFinite(width) && isFinite(height)) {
			let isWindowResize = resizing === SIZES.WINDOW;
			let isAspectResize = resizing === SIZES.ASPECT_RATIO;
			let canUpdate = isWindowResize || isAspectResize;

			if (canUpdate) {
				let newWidth, newHeight;

				if (isWindowResize) {
					newWidth = width;
					newHeight = height;
				} else if (isAspectResize) {
					const { offsetWidth, offsetHeight } = node;
					const aspectRatio = rendering.aspectRatio;
					const monitorRatio = offsetWidth / offsetHeight;

					if (aspectRatio < monitorRatio) {
						newHeight = offsetHeight;
						newWidth = newHeight * aspectRatio;
					} else {
						newWidth = offsetWidth;
						newHeight = newWidth / aspectRatio;
					}
				}

				let needsUpdate =
					newWidth !== rendering.width ||
					newHeight !== rendering.height;

				if (needsUpdate) {
					rendering.width = newWidth;
					rendering.height = newHeight;
				}
			}
		}
	}

	onMount(() => {
		monitors.register(id);
		// console.log(`Monitor :: mount`, id);

		return () => {
			// console.log(`Monitor :: destroy`, id);
			monitors.remove(id);
		};
	});

	$effect(() => {
		if (index === 0) {
			checkForResize(rendering.resizing, dimensions);
		}
	});

	/**
	 *
	 * @param {ResizeObserverEntry[]} event
	 */
	function onresize(event) {
		const { contentRect, target } = event[0];

		if (!node) node = target;

		const width = Math.round(contentRect.width);
		const height = Math.round(contentRect.height);

		dimensions.width = width;
		dimensions.height = height;
	}
</script>

{#snippet headerLeft()}
	<SketchSelect monitorID={id} selected={key} />
{/snippet}

<Module
	{id}
	{headless}
	slug="monitor"
	{name}
	scrollable={false}
	{headerLeft}
	{onresize}
>
	<!-- {#if selected && selected !== 'output'} -->
	<SketchRenderer {key} {id} />
	{#if error}
		<ErrorOverlay {error} />
	{/if}
	<!-- {:else if selected}
		<OutputRenderer />
	{/if} -->
</Module>
