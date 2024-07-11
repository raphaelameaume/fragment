<script>
	import { onMount, onDestroy } from 'svelte';
	import { derived } from 'svelte/store';
	import KeyBinding from '../components/KeyBinding.svelte';
	import { sketchesManager } from '../state/sketches.svelte.js';
	import { layout } from '../stores/layout.js';
	import { sync, monitors } from '../stores/rendering.js';
	import { rendering, SIZES } from '../state/rendering.svelte';
	import { errors, displayError, clearError } from '../state/errors.svelte.js';
	import { findRenderer } from '../stores/renderers';
	import { map } from '../utils/math.utils';
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
	import ErrorOverlay from './ErrorOverlay.svelte';
	import RecordHint from '../components/RecordHint.svelte';

	let { key, id, paused, visible = true } = $props();

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

	let sketch = $derived(sketchesManager.sketches[key]);
	let sketchProps = $derived(sketch?.props);
	let framerate = $derived(sketch.fps);
	let canvas;
	let created = false;
	let errored = $state(false);
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


	// sketchProps.subscribe(() => {
	// 	if (framerate === 0) {
	// 		// ensure we don't double render from createSketch
	// 		requestAnimationFrame(() => {
	// 			needsRender = true;
	// 		});
	// 	}
	// });

	// function createCanvas(canvas = document.createElement('canvas')) {
	// 	canvas.onmousedown = (event) => checkForTriggersDown(event, key);
	// 	canvas.onmousemove = (event) => checkForTriggersMove(event, key);
	// 	canvas.onmouseup = (event) => checkForTriggersUp(event, key);
	// 	canvas.onclick = (event) => checkForTriggersClick(event, key);

	// 	container.appendChild(canvas);

	// 	$monitors = $monitors.map((monitor) => {
	// 		if (monitor.id === id) {
	// 			return { ...monitor, canvas };
	// 		}

	// 		return monitor;
	// 	});

	// 	return canvas;
	// }

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
		if (!sketch) return;

		clearError(key);
		
		if (canvas) {
			if (renderer && typeof renderer.onDestroyPreview === 'function') {
				renderer.onDestroyPreview({ id, container, canvas });
			}

			if (canvas.parentNode) {
				canvas.parentNode.removeChild(canvas);
			}

			canvas.onmousedown = null;
			canvas.onmousemove = null;
			canvas.onmouseup = null;
			canvas.onclick = null;
			canvas = null;
		}

		renderer = await findRenderer({
			rendering: sketch.rendering,
			renderer: sketch.renderer,
		});

		canvas = sketch.createCanvas();
		container.appendChild(canvas);

		if (renderer && typeof renderer.onMountPreview === 'function') {
			mountParams = renderer.onMountPreview({
				id,
				canvas,
				container,
				width: rendering.width,
				height: rendering.height,
				pixelRatio: rendering.pixelRatio,
			});

			if (mountParams.canvas && mountParams.canvas !== canvas) {
				sketch.destroyCanvas();
				sketch.createCanvas(mountParams.canvas);
				canvas = mountParams.canvas;
			}
		}

		// trigger resize
		params = {
			...mountParams,
			canvas,
			publicPath: `@fs${__CWD__}`,
		};

		const { init, resize } = sketch;
		const { width, height, pixelRatio } = rendering;

		try {
			elapsedRenderingTime = 0;

			if (sketch.load) {
				await sketch.load({
					width,
					height,
					pixelRatio,
					props: sketchProps,
					...params,
				});
			}

			await init({
				width,
				height,
				pixelRatio,
				props: sketchProps,
				...params,
			});

			resize({
				width,
				height,
				pixelRatio,
				props: sketchProps,
				...params,
			});

			created = true;
			errored = false;

			_renderSketch = createRenderLoop();

			requestAnimationFrame(() => {
				needsRender = true;

				if (!_raf) {
					render();
				}
			});
		} catch (error) {
			onError(error);
		}
	});

	// $effect(async () => {
	// 	// console.log('create sketch');
	// 	// // // sketch?.dispose?.(params);

	// 	// // // sketch = sketches[key];

	// 	// if (!sketch) {
	// 	// 	console.log('errored', sketch);
	// 	// 	errored = true;

	// 	// 	if (_raf) {
	// 	// 		cancelAnimationFrame(_raf);
	// 	// 		_raf = null;
	// 	// 	}

	// 	// 	return;
	// 	// }

	// 	console.log('create sketch after', sketch.key);

	// 	// clearError(key);

	// 	if (canvas) {
	// 		if (renderer && typeof renderer.onDestroyPreview === 'function') {
	// 			renderer.onDestroyPreview({ id, container, canvas });
	// 		}

	// 		sketch.destroyCanvas();
	// 	}

	// 	renderer = await findRenderer({
	// 		rendering: sketch.rendering,
	// 		renderer: sketch.renderer,
	// 	});

	// 	console.log(renderer);

	// 	if (!container) return;

	// 	sketch.createCanvas();

	// 	if (rendering.resizing === SIZES.SCALE) {
	// 		canvas.style.transform = `scale(${rendering.scale})`;
	// 	} else {
	// 		canvas.style.transform = null;
	// 	}

	// 	removeHotListeners(sketch.key);
	// 	removeHooksFrom(sketch.key);

	/**
	 *
	 * @param {Error} error
	 */
	function onError(error) {
		errored = true;
		console.error(error);

		displayError(error, key);

		cancelAnimationFrame(_raf);
		_raf = null;
	}


	// $: {
	// 	const recordArgs = {
	// 		encoding: $exports.videoFormat,
	// 		quality: $exports.videoQuality,
	// 		framerate: $exports.framerate,
	// 	};

	// 	function onRecordEnd() {
	// 		record = null;
	// 		paused = false;

	// 		afterRecordCallbacks.forEach((callback) => {
	// 			callback(recordArgs);
	// 		});

	// 		_renderSketch();
	// 	}

	// 	if ($recording && !record) {
	// 		let recordOptions = {
	// 			onTick: _renderSketch,
	// 			framerate: $exports.framerate,
	// 			filename: key,
	// 			exportDir: sketch?.exportDir,
	// 			pattern: sketch?.filenamePattern,
	// 			format: $exports.videoFormat,
	// 			imageEncoding: $exports.imageEncoding,
	// 			quality: $exports.videoQuality,
	// 			params: {
	// 				props: sketch?.props,
	// 			},
	// 			onStart: () => {
	// 				beforeRecordCallbacks.forEach((callback) => {
	// 					callback(recordArgs);
	// 				});

	// 				elapsedRenderingTime = 0;
	// 				paused = true;
	// 			},
	// 			onComplete: () => {
	// 				$recording = false;
	// 				onRecordEnd();
	// 			},
	// 		};

	// 		if ($exports.useDuration) {
	// 			recordOptions.duration = sketch.duration * $exports.loopCount;
	// 		}

	// 		record = recordCanvas(canvas, recordOptions);
	// 	}

	// 	if (record && !$recording) {
	// 		record.stop();
	// 	}
	// }

	// $: {
	// 	if (!capture && $capturing) {
	// 		save();
	// 	}
	// }

	function createRenderLoop() {
		const { width, height, pixelRatio } = rendering;
		const { duration, draw } = sketch;

		let playhead = NaN;
		let playcount = NaN;
		let frame = NaN;
		let hasDuration = isFinite(duration);

		let onBeforeUpdatePreview =
			(renderer && renderer.onBeforeUpdatePreview) || noop;
		let onAfterUpdatePreview =
			(renderer && renderer.onAfterUpdatePreview) || noop;

		let frameLength = 1000 / framerate;
		let frameCount = framerate * duration;
		let interval = 1 / frameCount;

		return ({
			time = performance.now(),
			deltaTime = time - lastTime,
		} = {}) => {
			needsRender = false;
			lastTime = time;

			try {
				onBeforeUpdatePreview({ id, canvas, container });

				let t = !$sync
					? elapsedRenderingTime
					: Math.floor(time / frameLength) * frameLength;

				if (hasDuration && framerate > 0) {
					playhead = t / 1000 / duration;
					playhead %= 1;
					playhead = Math.floor(playhead / interval) * interval;
					playcount = Math.floor(
						elapsedRenderingTime / 1000 / duration,
					);

					frame = Math.floor(map(playhead, 0, 1, 1, frameCount + 1));
				}

				draw({
					...renderer,
					...params,
					props: sketchProps,
					playhead,
					playcount,
					frame,
					width,
					height,
					pixelRatio,
					time: t,
					deltaTime,
				});
				onAfterUpdatePreview({ id, canvas, container });

				elapsedRenderingTime += deltaTime;
			} catch (error) {
				onError(error);
			}
		};
	}

	function render() {
		_raf = requestAnimationFrame(render);

		now = performance.now();
		dt = now - then;
		then = now;

		if (!paused) {
			elapsed += dt;

			if (!$sync) {
				if (elapsed >= (1 / framerate) * 1000 && created) {
					elapsed = 0;
					_renderSketch();
				}
			} else {
				_renderSketch();
			}
		} else {
			lastTime = now;
		}

		if (needsRender && created) {
			_renderSketch();
		}
	}



	// $: {
	// 	if (canvas && _cacheKey !== key) {
	// 		if (created) {
	// 			clearError(_cacheKey);
	// 		}

	// 		_cacheKey = key;
	// 		createSketch(key);
	// 	}
	// }

	async function save() {
		paused = true;

		const {
			imageCount = 1,
			imageEncoding,
			imageQuality,
			pixelsPerInch,
		} = $exports;

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

	// sync.subscribe(() => {
	// 	if (created) {
	// 		_renderSketch = createRenderLoop();
	// 	}
	// });

	onMount(() => {
		console.log(`SketchRenderer :: onMount`);

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
			sketch.reset({
				width: rendering.width,
				height: rendering.height,
				pixelRatio: rendering.pixelRatio,
			});
		}
	}

	onDestroy(() => {
		resizeObserver.unobserve(node);
		cancelAnimationFrame(_raf);

		if (renderer && typeof renderer.onDestroyPreview === 'function') {
			renderer.onDestroyPreview({ id, canvas, container });
		}

		renderer = null;

		// if (sketch) {
		// 	sketch.destroyCanvas();
		// }

		created = false;
	});

	$effect(() => {
		const { width, height, pixelRatio, resizing, scale } = rendering;
		
		console.log(rendering.width);

		if (renderer && typeof renderer.onResizePreview === 'function') {
			renderer.onResizePreview({
				id,
				container,
				width,
				height,
				pixelRatio,
				...params,
			});
		}

		if (canvas) {
			if (resizing === SIZES.SCALE) {
				canvas.style.transform = `scale(${scale})`;
			} else {
				canvas.style.transform = null;
			}
		}

		if (created) {
			// sketch?.resize?.({
			// 	width,
			// 	height,
			// 	pixelRatio,
			// 	...params,
			// });
		}
	})

	// $: {
	// 	checkForResize();

	

	// 	if (canvas) {
	

	// 		if (created) {
	

	// 			_renderSketch = createRenderLoop();
	// 			_renderSketch();
	// 		}
	// 	}
	// }

	let error = $derived(
		errors.has(sketch?.key)
			? errors.get(sketch.key) // display error if error context match current key
			: errors.size === 1 &&
				  ![...errors.keys()].some((key) =>
						sketchesManager.keys.includes(key),
				  ) &&
				  ($monitors.length === 1 || // if there's only one monitor
						!$monitors.some(
							(m) => m.selected === errors.keys().next().value,
						)) // if none of current monitors match the key
				? errors.get(errors.keys().next().value)
				: null);
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
<!-- <KeyBinding type="down" key="S" onTrigger={checkForRecord} /> -->

{#if error}
	<ErrorOverlay {error} />
{/if}

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
