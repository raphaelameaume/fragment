<script>
	import Module from '../ui/Module.svelte';
	import SketchRenderer from '../ui/SketchRenderer.svelte';
	import OutputRenderer from '../ui/OutputRenderer.svelte';
	import SketchSelect from '../ui/SketchSelect.svelte';

	import ErrorOverlay from '../ui/ErrorOverlay.svelte';
	import { errors } from '../state/errors.svelte.js';
	import { onMount } from 'svelte';
	import { layout } from '../state/layout.svelte';
	import { rendering, SIZES } from '../state/rendering.svelte.js';
	import ModuleHeaderAction from '../ui/ModuleHeaderAction.svelte';
	import { sketchesManager } from '../state/sketches.svelte';

	let {
		id = layout.getID(),
		headless = false,
		sketchKey = null,
		params,
	} = $props();

	let key = $derived(
		sketchesManager.keys.includes(params.selected)
			? params.selected
			: sketchesManager.keys[0],
	);

	let monitors = $derived(rendering.monitors);
	let monitorID = rendering.getMonitorID();
	let index = $derived(monitors.findIndex((m) => m.id === monitorID));
	let name = $derived(
		`Monitor ${monitors.length > 1 ? index + 1 : ''}`.trim(),
	);
	let monitor = $derived(monitors[index]);

	// display error if error context match current key
	// or if an error doesn't match any params from monitor
	let error = $derived(
		errors.has(key)
			? errors.get(key)
			: monitors.length === 1 ||
				  !monitors.some(
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
	let zoomLevel = $derived.by(() => {
		const zx = dimensions.width / rendering.width;
		const zy = dimensions.height / rendering.height;

		if (zx >= 1 && zy >= 1) {
			return 100;
		} else {
			return Math.round(Math.min(zx, zy) * 100);
		}
	});

	function checkForResize(resizing, { width, height }) {
		if (isFinite(width) && isFinite(height)) {
			let isWindowResize = resizing === SIZES.WINDOW;
			let isAspectResize = resizing === SIZES.ASPECT_RATIO;
			let canUpdate = isWindowResize || isAspectResize;

			if (canUpdate) {
				let newWidth, newHeight;

				if (isWindowResize) {
					newWidth = Math.round(width);
					newHeight = Math.round(height);
				} else if (isAspectResize) {
					const { offsetWidth, offsetHeight } = node;
					const aspectRatio = rendering.aspectRatio;
					const monitorRatio = offsetWidth / offsetHeight;

					if (aspectRatio < monitorRatio) {
						newHeight = offsetHeight;
						newWidth = Math.round(newHeight * aspectRatio);
					} else {
						newWidth = offsetWidth;
						newHeight = Math.round(newWidth / aspectRatio);
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
		rendering.monitors.push({
			id: monitorID,
			dimensions,
		});

		return () => {
			const monitorIndex = rendering.monitors.findIndex(
				(m) => m.id === monitorID,
			);
			rendering.monitors.splice(monitorIndex, 1);
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

		dimensions.width = contentRect.width;
		dimensions.height = contentRect.height;
	}
</script>

{#snippet headerLeft()}
	<SketchSelect
		monitorID={id}
		sketchKey={key}
		onchange={(event) => {
			params.selected = event.target.value;
		}}
	/>
{/snippet}

{#snippet headerRight()}
	<ModuleHeaderAction
		value={zoomLevel}
		permanent
		border
		options={[{ value: zoomLevel, label: `${zoomLevel}%` }]}
	/>
{/snippet}

<Module
	{id}
	{headless}
	slug="monitor"
	{name}
	scrollable={false}
	{headerLeft}
	{headerRight}
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
