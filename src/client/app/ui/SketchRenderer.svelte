<script>
	import { onMount, onDestroy } from 'svelte';
	import { derived } from 'svelte/store';
	import KeyBinding from '../components/KeyBinding.svelte';
	import { sketches, sketchesKeys } from '../stores/sketches.js';
	import { layout } from '../stores/layout.js';
	import { rendering, SIZES, sync, monitors } from '../stores/rendering.js';
	import { errors, displayError, clearError } from '../stores/errors.js';
	import { exports, props } from '../stores/index.js';
	import { findRenderer } from '../stores/renderers';
	import { map } from '../utils/math.utils';
	import {
		recording,
		capturing,
		beforeCapture,
		afterCapture,
		beforeRecord,
		afterRecord,
	} from '../stores/exports.js';
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
	import { resetProps } from '../stores/props';

	export let key;
	export let id = 0;
	export let paused = false;
	export let visible = true;

	let node;
	/** @type {HTMLDivElement} */
	let container;
	let framerate = 60;
	let elapsed = 0;
	let elapsedRenderingTime = 0;
	let now = performance.now(),
		then = performance.now(),
		dt = 0,
		lastTime = performance.now();
	let canvas;
	let _raf;
	let _key = key;

	let sketch;
	let _created = false,
		_errored = false;
	let renderer;
	let noop = () => {};
	let _renderSketch = noop;
	let backgroundColor = 'inherit';

	$: beforeCaptureCallbacks = $beforeCapture.get(key) || [];
	$: afterCaptureCallbacks = $afterCapture.get(key) || [];
	$: beforeRecordCallbacks = $beforeRecord.get(key) || [];
	$: afterRecordCallbacks = $afterRecord.get(key) || [];

	function checkForResize(resizing = $rendering.resizing) {
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
				const aspectRatio = $rendering.aspectRatio;
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
				newWidth !== $rendering.width ||
				newHeight !== $rendering.height;

			if (needsUpdate) {
				rendering.update((curr) => {
					return {
						...curr,
						width: newWidth,
						height: newHeight,
					};
				});
			}
		}
	}

	let resizeObserver = new ResizeObserver(() => {
		checkForResize();
	});

	let params = {};

	let sketchProps = derived(props, () => {
		return $props[key];
	});

	let needsRender = false;

	sketchProps.subscribe(() => {
		if (framerate === 0) {
			// ensure we don't double render from createSketch
			requestAnimationFrame(() => {
				needsRender = true;
			});
		}
	});

	layout.subscribe(() => {
		setBackgroundColor();
	});

	function createCanvas(canvas = document.createElement('canvas')) {
		canvas.onmousedown = (event) => checkForTriggersDown(event, key);
		canvas.onmousemove = (event) => checkForTriggersMove(event, key);
		canvas.onmouseup = (event) => checkForTriggersUp(event, key);
		canvas.onclick = (event) => checkForTriggersClick(event, key);

		container.appendChild(canvas);

		$monitors = $monitors.map((monitor) => {
			if (monitor.id === id) {
				return { ...monitor, canvas };
			}

			return monitor;
		});

		return canvas;
	}

	function destroyCanvas(canvas) {
		canvas.onmousedown = null;
		canvas.onmousemove = null;
		canvas.onmouseup = null;
		canvas.onclick = null;

		if (canvas.parentNode === container) {
			canvas.parentNode.removeChild(canvas);
		}

		canvas = null;
	}

	function setBackgroundColor() {
		if (sketch) {
			if (
				($layout.previewing || __BUILD__) &&
				sketch.buildConfig &&
				sketch.buildConfig.backgroundColor
			) {
				backgroundColor = sketch.buildConfig.backgroundColor;
			} else if (!$layout.previewing && sketch.backgroundColor) {
				backgroundColor = sketch.backgroundColor;
			} else {
				backgroundColor = 'inherit';
			}
		} else {
			backgroundColor = 'inherit';
		}
	}

	async function createSketch(key) {
		_created = false;

		sketch?.dispose?.();

		sketch = $sketches[key];

		if (!key || !sketch) {
			_errored = true;

			if (_raf) {
				cancelAnimationFrame(_raf);
				_raf = null;
			}

			return;
		}

		clearError(key);
		setBackgroundColor();

		if (canvas) {
			if (renderer && typeof renderer.onDestroyPreview === 'function') {
				renderer.onDestroyPreview({ id, container, canvas });
			}

			destroyCanvas(canvas);
		}

		renderer = await findRenderer({
			rendering: sketch.rendering,
			renderer: sketch.renderer,
		});

		if (!container) return;

		canvas = createCanvas();

		if ($rendering.resizing === SIZES.SCALE) {
			canvas.style.transform = `scale(${$rendering.scale})`;
		} else {
			canvas.style.transform = null;
		}

		removeHotListeners(key);
		removeHooksFrom(key);

		let mountParams = {};

		if (renderer && typeof renderer.onMountPreview === 'function') {
			mountParams = renderer.onMountPreview({
				id,
				canvas,
				container,
				width: $rendering.width,
				height: $rendering.height,
				pixelRatio: $rendering.pixelRatio,
			});
		}

		if (mountParams.canvas && mountParams.canvas !== canvas) {
			destroyCanvas(canvas);
			canvas = createCanvas(mountParams.canvas);
		}

		params = {
			...mountParams,
			canvas,
			publicPath: `@fs${__CWD__}`,
		};

		framerate = isFinite(sketch.fps) ? sketch.fps : 60;

		const init = sketch.setup || sketch.init || noop;
		const resize = sketch.resize || noop;
		const { width, height, pixelRatio } = $rendering;

		try {
			elapsedRenderingTime = 0;

			if (sketch.load) {
				await sketch.load({
					width,
					height,
					pixelRatio,
					props: $sketchProps,
					...params,
				});
			}

			init({
				width,
				height,
				pixelRatio,
				props: $sketchProps,
				...params,
			});

			resize({
				canvas,
				width,
				height,
				pixelRatio,
				props: $sketchProps,
				...params,
			});

			_created = true;
			_errored = false;

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
	}

	/**
	 *
	 * @param {Error} error
	 */
	function onError(error) {
		_errored = true;
		console.error(error);

		displayError(error, key);

		cancelAnimationFrame(_raf);
		_raf = null;
	}

	let record = $recording;
	let capture = $capturing;

	$: {
		const recordArgs = {
			encoding: $exports.videoFormat,
			quality: $exports.videoQuality,
			framerate: $exports.framerate,
		};

		function onRecordEnd() {
			record = null;
			paused = false;

			afterRecordCallbacks.forEach((callback) => {
				callback(recordArgs);
			});

			_renderSketch();
		}

		if ($recording && !record) {
			let recordOptions = {
				onTick: _renderSketch,
				framerate: $exports.framerate,
				filename: key,
				exportDir: sketch?.exportDir,
				pattern: sketch?.filenamePattern,
				format: $exports.videoFormat,
				imageEncoding: $exports.imageEncoding,
				quality: $exports.videoQuality,
				params: {
					props: sketch?.props,
				},
				onStart: () => {
					beforeRecordCallbacks.forEach((callback) => {
						callback(recordArgs);
					});

					elapsedRenderingTime = 0;
					paused = true;
				},
				onComplete: () => {
					$recording = false;
					onRecordEnd();
				},
			};

			if ($exports.useDuration) {
				recordOptions.duration = sketch.duration * $exports.loopCount;
			}

			record = recordCanvas(canvas, recordOptions);
		}

		if (record && !$recording) {
			record.stop();
		}
	}

	$: {
		if (!capture && $capturing) {
			save();
		}
	}

	function createRenderLoop() {
		const { width, height, pixelRatio } = $rendering;
		const draw = sketch.draw || sketch.update;
		const { duration } = sketch;

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
					props: $sketchProps,
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
				if (elapsed >= (1 / framerate) * 1000 && _created) {
					elapsed = 0;
					_renderSketch();
				}
			} else {
				_renderSketch();
			}
		} else {
			lastTime = now;
		}

		if (needsRender && _created) {
			_renderSketch();
		}
	}

	$: {
		if (canvas && _key !== key) {
			if (_created) {
				clearError(_key);
			}

			_key = key;
			createSketch(key);
		}
	}

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
			$capturing = false;

			afterCaptureCallbacks.forEach((callback) => {
				callback({ ...captureArgs, index: i });
			});

			_renderSketch();
		}
	}

	sync.subscribe(() => {
		if (_created) {
			_renderSketch = createRenderLoop();
		}
	});

	onMount(() => {
		createSketch(key);

		sketches.subscribe(() => {
			if (_created || _errored) {
				createSketch(key);
			}
		});

		client.on('shader-update', () => {
			if (framerate === 0) {
				needsRender = true;
			}
		});

		resizeObserver.observe(node);
	});

	function checkForPause(event) {
		const keyboardEvent = event.detail;

		if (!keyboardEvent.metaKey || !keyboardEvent.ctrlKey) {
			keyboardEvent.preventDefault();

			if (!$recording) {
				then = performance.now();
				paused = !paused;
			} else {
				console.warn(`Cannot pause while recording.`);
			}
		}
	}

	function checkForSave(event) {
		const keyboardEvent = event.detail;

		if (keyboardEvent.metaKey || keyboardEvent.ctrlKey) {
			keyboardEvent.preventDefault();

			if (!$recording) {
				save();
			} else {
				console.warn(`Cannot save while recording.`);
			}
		}
	}

	function checkForRecord(event) {
		const keyboardEvent = event.detail;
		keyboardEvent.preventDefault();

		$recording = !$recording;
	}

	function checkForRefresh(event) {
		const keyboardEvent = event.detail;
		if (!keyboardEvent.metaKey && !keyboardEvent.ctrlKey) {
			keyboardEvent.preventDefault();
			resetProps(key, {
				width: $rendering.width,
				height: $rendering.height,
				pixelRatio: $rendering.pixelRatio,
			});
			console.log(`[fragment] ${key} reloaded.`);
			createSketch(key);
		}
	}

	onDestroy(() => {
		resizeObserver.unobserve(node);
		cancelAnimationFrame(_raf);

		if (renderer && typeof renderer.onDestroyPreview === 'function') {
			renderer.onDestroyPreview({ id, canvas, container });
		}

		renderer = null;

		if (canvas) {
			destroyCanvas(canvas);
		}

		_created = false;
	});

	$: {
		checkForResize();

		const { width, height, pixelRatio, resizing, scale } = $rendering;

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

			if (_created) {
				sketch?.resize?.({
					canvas,
					width,
					height,
					pixelRatio,
					...params,
				});

				_renderSketch = createRenderLoop();
				_renderSketch();
			}
		}
	}

	$: error =
		key && $errors.has(key)
			? $errors.get(key) // display error if error context match current key
			: $errors.size === 1 &&
				  ![...$errors.keys()].some((key) =>
						$sketchesKeys.includes(key),
				  ) &&
				  ($monitors.length === 1 || // if there's only one monitor
						!$monitors.some(
							(m) => m.selected === $errors.keys().next().value,
						)) // if none of current monitors match the key
				? $errors.get($errors.keys().next().value)
				: null;

	$: isSquare = $rendering.width === $rendering.height;
	$: isLandscape = $rendering.width > $rendering.height;
	$: isPortrait = $rendering.width < $rendering.height;
</script>

<div
	bind:this={node}
	class="sketch-renderer"
	class:visible
	class:recording={$recording}
	style={`--background-color: ${backgroundColor}`}
>
	<div
		class="canvas-container"
		style="--aspect-ratio: {$rendering.width} / {$rendering.height}; --aspect-ratio-inverse: {$rendering.height} / {$rendering.width}; --width: {$rendering.width}px; --height: {$rendering.height}px;"
		bind:this={container}
	/>
	{#if $recording}
		<span class="record">REC</span>
	{/if}
</div>
<KeyBinding type="down" key=" " on:trigger={checkForPause} />
<KeyBinding type="down" key="r" on:trigger={checkForRefresh} />
<KeyBinding type="down" key="s" on:trigger={checkForSave} />
<KeyBinding type="down" key="S" on:trigger={checkForRecord} />

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

	.record {
		position: absolute;
		top: 4px;
		right: 4px;
		z-index: 2;

		display: flex;
		place-items: center;

		height: 16px;
		padding: 0 2px;

		color: var(--color-red);
		font-size: 10px;

		border: 1px solid var(--color-red);
		border-radius: 2px;
	}

	.record:before {
		--size: 6px;
		content: '';

		width: var(--size);
		height: var(--size);
		margin: 0 3px 0 1px;

		background-color: var(--color-red);
		border-radius: 50%;

		animation: fade 1s ease-in-out infinite;
	}

	@keyframes fade {
		0% {
			opacity: 0;
		}

		50% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}
</style>
