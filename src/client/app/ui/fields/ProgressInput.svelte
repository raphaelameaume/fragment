<script>
	import { createEventDispatcher } from 'svelte';
	import { map, clamp, roundToStep } from '../../utils/math.utils.js';

	export let value;
	export let min;
	export let max;
	export let step;
	export let context = null;
	export let key = '';
	export let disabled = false;

	let node;
	let rect;

	const dispatch = createEventDispatcher();

	let isDragging = false;

	// handlers
	function handleMouseDown(event) {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		rect = node.getBoundingClientRect();

		isDragging = true;

		onDrag(event);
	}

	function handleMouseMove(event) {
		onDrag(event);
	}

	function onDrag(event) {
		let dragValue = clamp(
			map(event.clientX, rect.left, rect.right, min, max),
			min,
			max,
		);
		dragValue = roundToStep(dragValue, step);

		if (dragValue !== value) {
			dispatch('change', dragValue);
		}
	}

	function handleMouseUp() {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		isDragging = false;
	}

	$: progress = clamp(map(value, min, max, 0, 1), 0.0001, 1);
	$: opacity = progress > 0 ? 1 * (disabled ? 0.4 : 1) : 0;
</script>

<div
	class="progress {isDragging ? 'dragging' : ''} "
	bind:this={node}
	on:mousedown={handleMouseDown}
>
	<div class="fill" style="--progress: {progress}; --opacity: {opacity};" />
</div>

<style>
	.progress {
		position: relative;

		height: var(--height-input);
		border-radius: var(--border-radius-input);
		box-shadow: inset 0 0 0 1px var(--color-border-input);

		background: var(--color-background-input);
		cursor: ew-resize;
		container-type: size;
	}

	.progress:hover {
		box-shadow: inset 0 0 0 1px var(--color-active);
	}

	.progress.dragging {
		box-shadow: 0 0 0 2px var(--color-active);
	}

	.fill {
		--padding-h: 3px;
		--width: 6px;
		--tx-min: var(--padding-h);
		--tx-max: calc(100cqw - var(--padding-h) * 1 - var(--width));

		--tx: calc(
			var(--progress, 0) * (var(--tx-max) - var(--tx-min)) / (1) +
				var(--tx-min)
		);
		position: absolute;
		left: 0px;
		top: 3px;
		bottom: 3px;
		/* right: 3px; */

		width: var(--width);

		background: grey;
		transform-origin: 0 50%;
		border-radius: calc(var(--border-radius-input) * 0.5);

		background-color: var(--color-active);

		transform: translate3d(var(--tx), 0px, 0px);

		opacity: var(--opacity, 1);
	}
</style>
