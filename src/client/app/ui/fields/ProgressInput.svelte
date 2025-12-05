<script>
	import Keyboard from '../../inputs/Keyboard.js';
	import { map, clamp, roundToStep } from '../../utils/math.utils.js';

	let { value, min, max, step, disabled = false, onchange } = $props();

	let node;
	let rect;

	let isDragging = $state(false);
	let steppedValue = $derived(roundToStep(value, step));

	// handlers
	function handleMouseDown(event) {
		if (disabled) return;

		document.body.classList.add('fragment-dragging');
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
			onchange(dragValue);
		}
	}

	function handleKeyDown(event) {
		const direction = ['ArrowUp', 'ArrowRight'].includes(event.key)
			? 1
			: ['ArrowDown', 'ArrowLeft'].includes(event.key)
				? -1
				: 0;

		const diff = Keyboard.getStepFromEvent(event) * step;

		if (direction !== 0) {
			const newValue = clamp(
				roundToStep(value + direction * diff, step),
				min,
				max,
			);

			if (newValue !== value) {
				onchange(newValue);
			}
		}
	}

	function handleMouseUp() {
		document.body.classList.remove('fragment-dragging');
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		isDragging = false;
	}

	let progress = $derived(
		clamp(map(steppedValue, min, max, 0, 1), 0.0001, 1),
	);
	let opacity = $derived(progress > 0 ? 1 : 0);
</script>

<div
	class="progress"
	bind:this={node}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	class:disabled
	class:dragging={isDragging}
	role="slider"
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value}
	tabindex={disabled ? -1 : 0}
>
	<div
		class="fill"
		style="--progress: {progress}; --opacity: {opacity};"
	></div>
</div>

<style>
	.progress {
		position: relative;

		height: var(--fragment-input-height);
		border-radius: var(--fragment-input-border-radius);
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);

		background: var(--fragment-input-background-color);

		container-type: size;
		outline: 0;
	}

	.progress:not(.disabled) {
		cursor: ew-resize;
	}

	:global(body:not(.fragment-dragging)) .progress:not(.disabled):hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	.progress.dragging,
	:global(body:not(.fragment-dragging))
		.progress:not(.disabled):focus-visible {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
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
		border-radius: calc(var(--fragment-input-border-radius) * 0.5);

		background-color: var(--fragment-accent-color);

		transform: translate3d(var(--tx), 0px, 0px);
	}

	.progress.disabled .fill {
		background-color: var(--fragment-color-disabled);
	}
</style>
