<script>
	import { onMount, onDestroy, untrack } from 'svelte';
	import { derived } from 'svelte/store';
	import { sketchesManager } from '../state/sketches.svelte.js';
	import { layout } from '../state/layout.svelte.js';
	import { rendering, SIZES } from '../state/rendering.svelte';
	import Sketch from '../state/Sketch.svelte.js';
	import { exports } from '../state/exports.svelte.js';
	import { client } from '../client';
	import HintRecord from '../components/HintRecord.svelte';
	import HintPaused from '../components/HintPaused.svelte';
	import HintLoading from '../components/HintLoading.svelte';

	let { key, id, visible = true } = $props();

	let node;
	/** @type {HTMLDivElement} */
	let container;
	let _raf;

	/** @type {Sketch} */
	let sketch = $derived(sketchesManager.sketches[key]);
	// let framerate = $derived(sketch.fps);
	let resizeObserver = new ResizeObserver(() => {
		checkForResize();
	});
	let loading = $derived(
		rendering.renders.find((r) => r.id === id)?.loading ?? true,
	);

	$inspect(loading);

	$effect(() => {
		if (sketch) {
			console.log('SketchRenderer :: mount');
			rendering.mount(id, container, sketch);
		}
	});

	function checkForResize(resizing = rendering.resizing) {
		if (!node) return;

		let isWindowResize = resizing === SIZES.WINDOW;
		let isAspectResize = resizing === SIZES.ASPECT_RATIO;
		let canUpdate = isWindowResize || isAspectResize;

		if (canUpdate) {
			let newWidth, newHeight;

			if (isWindowResize) {
				newWidth = node.offsetWidth;
				newHeight = node.offsetHeight;
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
				newWidth !== rendering.width || newHeight !== rendering.height;

			if (needsUpdate) {
				rendering.width = newWidth;
				rendering.height = newHeight;
			}
		}
	}

	$effect(() => {
		checkForResize(rendering.resizing);
	});

	let backgroundColor = $derived.by(() => {
		if (layout.previewing) {
			return sketch?.buildConfig?.backgroundColor ?? 'inherit';
		}

		return sketch?.backgroundColor ?? 'inherit';
	});

	onMount(() => {
		client.on('shader-update', () => {
			// if (framerate === 0) {
			// 	needsRender = true;
			// }
		});

		resizeObserver.observe(node);
	});

	onDestroy(() => {
		resizeObserver.unobserve(node);
		cancelAnimationFrame(_raf);

		rendering.unmount(id);
	});
</script>

<div
	bind:this={node}
	class="sketch-renderer"
	class:visible
	style={`--background-color: ${backgroundColor}`}
>
	<div
		class="canvas-container"
		style="--aspect-ratio: {rendering.width} / {rendering.height}; --aspect-ratio-inverse: {rendering.height} / {rendering.width}; --width: {rendering.width}px; --height: {rendering.height}px;"
		bind:this={container}
	></div>
	{#if exports.recording}
		<HintRecord />
	{/if}
	{#if rendering.paused && !exports.recording && !__BUILD__ && !layout.previewing}
		<HintPaused />
	{/if}
	{#if loading}
		<HintLoading />
	{/if}
</div>

<style>
	.sketch-renderer {
		position: relative;
		display: flex;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;

		background-color: var(--background-color, var(--color-lightblack));

		container-type: size;
	}

	.sketch-renderer:not(.visible) {
		display: none;
	}

	.canvas-container {
		--w: min(100cqw, calc(100cqh * var(--aspect-ratio)));
		position: relative;

		max-width: var(--width);
		max-height: var(--height);

		width: var(--w);
		height: calc(var(--w) * var(--aspect-ratio-inverse));
	}

	:global(.canvas-container canvas) {
		position: absolute;
		top: 0;
		left: 0;

		width: 100% !important;
		height: 100% !important;

		background-color: var(--background-color, #000000);
	}
</style>
