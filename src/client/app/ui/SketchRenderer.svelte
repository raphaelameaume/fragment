<script>
	import { onMount, onDestroy, untrack } from 'svelte';
	import { derived } from 'svelte/store';
	import KeyBinding from '../components/KeyBinding.svelte';
	import { sketchesManager } from '../state/sketches.svelte.js';
	import { layout } from '../stores/layout.js';
	import { sync, monitors } from '../stores/rendering.js';
	import { rendering, SIZES } from '../state/rendering.svelte';
	import { displayError, errors } from '../state/errors.svelte.js';
	import { findRenderer } from '../stores/renderers';
	import { map } from '../utils/math.utils';
	import Sketch from '../state/Sketch.svelte.js';
	import {
		exports,
		// beforeCapture,
		// afterCapture,
		// beforeRecord,
		// afterRecord,
	} from '../state/exports.svelte.js';
	import { removeHotListeners } from '../triggers/index.js';
	import { removeHooksFrom } from '../hooks';
	import {
		checkForTriggersDown,
		checkForTriggersMove,
		checkForTriggersUp,
		checkForTriggersClick,
	} from '../triggers/Mouse.js';
	import { client } from '../client';
	import { recordCanvas, screenshotCanvas } from '../utils/canvas.utils.js';
	import RecordHint from '../components/RecordHint.svelte';

	let { key, id, visible = true } = $props();

	let node;
	/** @type {HTMLDivElement} */
	let container;
	let elapsed = 0;
	let elapsedRenderingTime = 0;
	let now = performance.now(),
		then = performance.now(),
		dt = 0,
		lastTime = performance.now();
	let _raf;
	let _cacheKey;

	/** @type {Sketch} */
	let sketch = $derived(sketchesManager.sketches[key]);
	let sketchProps = $derived(sketch?.props);
	let framerate = $derived(sketch.fps);
	let error = $derived(
		errors.has(key)
			? errors.get(key) : errors.values().next().value);
	let canvas;
	let created = false;
	let errored = false;
	let renderer = $state(null);
	let noop = () => {};
	let _renderSketch = noop;
	let needsRender = false;
	let params = $state({});
	let mountParams = {};
	

	// $: beforeCaptureCallbacks = $beforeCapture.get(key) || [];
	// $: afterCaptureCallbacks = $afterCapture.get(key) || [];
	// $: beforeRecordCallbacks = $beforeRecord.get(key) || [];
	// $: afterRecordCallbacks = $afterRecord.get(key) || [];

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
				newWidth !== rendering.width ||
				newHeight !== rendering.height;

			if (needsUpdate) {
				rendering.width = newWidth;
				rendering.height = newHeight;
			}
		}
	}

	let resizeObserver = new ResizeObserver(() => {
		checkForResize();
	});

	$effect(() => {
		checkForResize(rendering.resizing);
	});

	let backgroundColor = $derived.by(() => {
		if (sketch) {
			if (
				(layout.previewing || __BUILD__) &&
				sketch.buildConfig &&
				sketch.buildConfig.backgroundColor
			) {
				return sketch.buildConfig.backgroundColor;
			} else if (!$layout.previewing && sketch.backgroundColor) {
				return sketch.backgroundColor;
			} else {
				return 'inherit';
			}
		} else {
			return 'inherit';
		}
	})

	$effect(async () => {
		if (sketch && container) {
			console.log('effect run');
			await rendering.mount(id, container, sketch);

			untrack(() => container);
		}
	});

	async function save() {
		paused = true;

		const {
			imageCount = 1,
			imageEncoding,
			imageQuality,
			pixelsPerInch,
		} = exports;

		const captureArgs = {
			encoding: imageEncoding,
			quality: imageQuality,
			pixelsPerInch,
			count: imageCount,
		};

		for (let i = 0; i < imageCount; i++) {
			beforeCaptureCallbacks.forEach((callback) => {
				callback({ ...captureArgs, index: i });
			});

			_renderSketch();

			await screenshotCanvas(canvas, {
				filename: key,
				pattern: sketch?.filenamePattern,
				exportDir: sketch?.exportDir,
				index: imageCount > 1 ? i : undefined,
				params: {
					props: sketch?.props,
				},
			});
			paused = false;
			// $capturing = false;

			afterCaptureCallbacks.forEach((callback) => {
				callback({ ...captureArgs, index: i });
			});

			_renderSketch();
		}
	}

	onMount(() => {
		client.on('shader-update', () => {
			if (framerate === 0) {
				needsRender = true;
			}
		});

		resizeObserver.observe(node);
	});

	// function checkForPause(event) {
		
	// 	const keyboardEvent = event.detail;

	// 	if (!keyboardEvent.metaKey || !keyboardEvent.ctrlKey) {
	// 		keyboardEvent.preventDefault();

	// 		if (!$recording) {
	// 			then = performance.now();
	// 			paused = !paused;
	// 		} else {
	// 			console.warn(`Cannot pause while recording.`);
	// 		}
	// 	}
	// }

	// function checkForSave(event) {
	// 	if (event.metaKey || event.ctrlKey) {
	// 		event.preventDefault();

	// 		if (!$recording) {
	// 			save();
	// 		} else {
	// 			console.warn(`Cannot save while recording.`);
	// 		}
	// 	}
	// }

	// function checkForRecord(event) {
	// 	event.preventDefault();

	// 	$recording = !$recording;
	// }

	function checkForRefresh(event) {
		if (!event.metaKey && !event.ctrlKey) {
			event.preventDefault();
			sketch.reset();
		}
	}

	onDestroy(() => {
		resizeObserver.unobserve(node);
		cancelAnimationFrame(_raf);

		rendering.unmount(id);

		console.log('SketchRenderer :: onDestroy');

		if (renderer && typeof renderer.onDestroyPreview === 'function') {
			renderer.onDestroyPreview({ id, canvas, container });
		}

		

		created = false;
	});
</script>

<div
	bind:this={node}
	class="sketch-renderer"
	class:visible
	class:recording={exports.recording}
	style={`--background-color: ${backgroundColor}`}
>
	<div
		class="canvas-container"
		style="--aspect-ratio: {rendering.width} / {rendering.height}; --aspect-ratio-inverse: {rendering.height} / {rendering.width}; --width: {rendering.width}px; --height: {rendering.height}px;"
		bind:this={container}
	/>
	{#if exports.recording}
		<RecordHint />
	{/if}
</div>
<!-- <KeyBinding type="down" key=" " onTrigger={checkForPause} /> -->
<KeyBinding type="down" key="r" onTrigger={checkForRefresh} />
<!-- <KeyBinding type="down" key="s" onTrigger={checkForSave} /> -->
<KeyBinding type="down" key="S" onTrigger={() => exports.recording = !exports.recording} />

<style>
	.sketch-renderer {
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

		background-color: red;
	}

	:global(.canvas-container canvas) {
		position: absolute;
		top: 0;
		left: 0;

		width: 100% !important;
		height: 100% !important;

		background-color: var(--background-color, #000000);
	}

	.sketch-renderer.recording .canvas-container {
		opacity: 0.5;
	}
</style>
