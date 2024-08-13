<script>
	import { onMount, onDestroy, untrack } from 'svelte';
	import { derived } from 'svelte/store';
	import { sketchesManager } from '../state/sketches.svelte.js';
	import { layout } from '../state/layout.svelte.js';
	import { rendering, SIZES } from '../state/rendering.svelte';
	import Sketch from '../state/Sketch.svelte.js';
	import { exports } from '../state/exports.svelte.js';
	import HintRecord from '../components/HintRecord.svelte';
	import HintPaused from '../components/HintPaused.svelte';
	import HintLoading from '../components/HintLoading.svelte';
	import { scale } from 'svelte/transition';

	let { key, id, visible = true } = $props();

	/** @type {HTMLDivElement} */
	let container;

	/** @type {Sketch} */
	let sketch = $derived(sketchesManager.sketches[key]);
	let loaded = $derived(
		rendering.renders.find((r) => r.id === id)?.loaded ?? false,
	);

	$effect(() => {
		if (sketch) {
			rendering.mount(id, container, sketch);
		}
	});

	let backgroundColor = $derived.by(() => {
		if (layout.previewing) {
			return sketch?.buildConfig?.backgroundColor ?? 'inherit';
		}

		return sketch?.backgroundColor ?? 'inherit';
	});

	onDestroy(() => {
		rendering.unmount(id);
	});
</script>

<div
	class="sketch-renderer"
	class:visible
	style={`--background-color: ${backgroundColor}`}
>
	<div
		class="canvas-container"
		style="--aspect-ratio: {rendering.width} / {rendering.height}; --aspect-ratio-inverse: {rendering.height} / {rendering.width}; --width: {rendering.width}px; --height: {rendering.height}px; {rendering.resizing ===
		SIZES.SCALE
			? `--scale: ${rendering.scale}`
			: ''}"
		bind:this={container}
	></div>
	{#if exports.recording}
		<HintRecord />
	{/if}
	{#if rendering.paused && !exports.recording && !__BUILD__ && !layout.previewing}
		<HintPaused />
	{/if}
	{#if !loaded}
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
		transform: scale(var(--scale));
	}
</style>
