<script>
	import { sketchesManager } from '../state/sketches.svelte.js';
	import { layout } from '../state/layout.svelte.js';
	import { Render, rendering, SIZES } from '../state/rendering.svelte';
	import Sketch from '../state/Sketch.svelte.js';
	import { exports } from '../state/exports.svelte.js';
	import HintRecord from '../components/HintRecord.svelte';
	import HintPaused from '../components/HintPaused.svelte';
	import KeyBinding from '../components/KeyBinding.svelte';
	import HintLoading from '../components/HintLoading.svelte';
	import { untrack } from 'svelte';

	let { key, id, visible = true } = $props();

	/** @type {HTMLDivElement} */
	let container;

	/** @type {Sketch} */
	let sketch = $derived(sketchesManager.sketches[key]);

	/** @type {Render} */
	let render = $derived(rendering.renders.find((r) => r.id === id));

	let loaded = $derived(
		rendering.renders.find((r) => r.id === id)?.loaded ?? false,
	);

	let paused = $derived(
		(render?.paused ?? false) &&
			!exports.recording &&
			!__BUILD__ &&
			!layout.previewing,
	);

	$effect(() => {
		if (!sketch) return;

		const renderer = rendering.findRenderer({
			renderingMode: sketch.instance.rendering,
		});

		let render = new Render({
			id,
			container,
			sketch,
			renderer,
		});

		untrack(() => rendering.renders.push(render));

		return () => {
			untrack(() => {
				const index = rendering.renders.findIndex(
					(r) => r.id === render.id,
				);

				if (index >= 0) {
					rendering.renders.splice(index, 1);
				}
			});

			render.dispose();
		};
	});

	$effect(() => {
		if (exports.recording && !render?.recording) {
			render.startRecording();
		} else if (render?.recording && !exports.recording) {
			render.stopRecording();
		}
	});

	function checkForRefresh(event) {
		if (!event.metaKey && !event.ctrlKey) {
			event.preventDefault();
			render.reset();
		}
	}

	function checkForPause(event) {
		if (!event.metaKey || !event.ctrlKey) {
			event.preventDefault();

			if (!exports.recording) {
				render.paused = !render.paused;
			} else {
				console.warn(`Fragment can't be paused while recording.`);
			}
		}
	}

	function checkForScreenshot(event) {
		if (event.metaKey || event.ctrlKey) {
			event.preventDefault();

			if (!exports.recording) {
				render.screenshot();
			} else {
				console.warn(`Fragment can't screenshot while recording.`);
			}
		}
	}

	function checkForRecord(event) {
		if (event.shiftKey) {
			exports.recording = !exports.recording;
		}
	}

	let backgroundColor = $derived.by(() => {
		if (layout.previewing) {
			return sketch?.buildConfig?.backgroundColor ?? 'inherit';
		}

		return sketch?.backgroundColor ?? 'inherit';
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
	{#if paused}
		<HintPaused />
	{/if}
	{#if !loaded}
		<HintLoading />
	{/if}
</div>

<KeyBinding type="down" key="r" onTrigger={checkForRefresh} />
<KeyBinding type="down" key=" " onTrigger={checkForPause} />
<KeyBinding type="down" key="s" onTrigger={checkForScreenshot} />
<KeyBinding type="down" key="S" onTrigger={checkForRecord} />

<style>
	.sketch-renderer {
		position: relative;
		display: flex;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;

		background-color: var(
			--background-color,
			var(--fragment-color-lightblack)
		);

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
