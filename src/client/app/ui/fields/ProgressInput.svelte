<script>
	import { draggable } from '../../attachments/draggable.js';
	import Keyboard from '../../inputs/Keyboard.js';
	import { map, clamp, roundToStep } from '../../utils/math.utils.js';

	/**
	 * @typedef {Object} Props
	 * @property {number} value
	 * @property {number} min
	 * @property {number} max
	 * @property {number} step
	 * @property {boolean} disabled
	 * @property {(value: number) => void|undefined} onchange
	 */

	/** @type {Props} */
	let { value, min, max, step, disabled = false, onchange } = $props();

	let dragging = $state(false);
	let steppedValue = $derived(roundToStep(value, step));

	/**
	 * @param {MouseEvent | TouchEvent} _
	 * @param {import('../../attachments/draggable.js').DragParams} params
	 */
	function onDrag(_, params) {
		if (disabled) return;

		dragging = params.isDragging;

		let dragValue = clamp(map(params.px, 0, 1, min, max), min, max);
		dragValue = roundToStep(dragValue, step);

		if (dragValue !== value) {
			onchange?.(dragValue);
		}
	}

	/**
	 * @param {KeyboardEvent} event
	 */
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
				onchange?.(newValue);
			}
		}
	}

	let progress = $derived(
		clamp(map(steppedValue, min, max, 0, 1), 0.0001, 1),
	);
	let opacity = $derived(progress > 0 ? 1 : 0);
</script>

<div
	class="progress"
	class:disabled
	class:dragging
	role="slider"
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value}
	tabindex={disabled ? -1 : 0}
	onkeydown={handleKeyDown}
	{@attach draggable({ onDrag })}
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
