<script>
	import FieldInputRow from './FieldInputRow.svelte';
	import NumberInput from './NumberInput.svelte';
	import { map, clamp, roundToStep } from '../../utils/math.utils';
	import { createEventDispatcher } from 'svelte';

	export let value = null;
	export let label = '';
	export let step = 1;
	export let suffix = '';
	export let min = -Infinity;
	export let max = Infinity;
	export let disabled = false;
	export let context = null;
	export let key = '';

	let dispatch = createEventDispatcher();

	/** @type {HTMLElement} */
	let node;
	/** @type {DOMRect}*/
	let rect;
	/** @type {boolean}*/
	let isDragging = false;

	let proximityIndex = -1;

	/**
	 *
	 * @param {MouseEvent} event
	 */
	function handleMouseDown(event) {
		document.body.style.userSelect = 'none';
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		rect = node.getBoundingClientRect();

		isDragging = true;

		let dragValue = computeDrag(event);

		let abs0 = Math.abs(dragValue - min);
		let abs1 = Math.abs(dragValue - max);

		proximityIndex = abs0 < abs1 ? 0 : 1;

		onDrag(event);
	}

	function computeDrag(event) {
		let dragValue = clamp(
			map(event.clientX, rect.left, rect.right, min, max),
			min,
			max,
		);
		dragValue = roundToStep(dragValue, step);
		return dragValue;
	}

	function handleMouseMove(event) {
		onDrag(event);
	}

	function onDrag(event) {
		let dragValue = computeDrag(event);

		let prevValue = value[proximityIndex];

		if (dragValue !== prevValue) {
			let newValues = [
				proximityIndex === 0
					? dragValue
					: Math.min(dragValue, value[0]),
				proximityIndex === 1
					? dragValue
					: Math.max(dragValue, value[1]),
			];

			value[0] = newValues[0];
			value[1] = newValues[1];

			dispatch('change', value);
		}
	}

	function handleMouseUp() {
		document.body.style.userSelect = null;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		isDragging = false;
	}

	$: {
		if (value[0] > value[1]) {
			console.warn(`Values provided for ${key} are in the wrong order. `);
		}

		value.forEach((v, index) => {
			if (v < min || v > max) {
				console.warn(
					`Value provided for ${key} at index ${index} is out of range [${min}:${max}]: ${v}`,
				);
			}
		});
	}

	$: p1 = map(clamp(value[0], min, max), min, max, 0, 1);
	$: p2 = map(clamp(value[1], min, max), min, max, 0, 1);

	$: opacity = 1;
</script>

<div class="interval-input">
	<FieldInputRow --grid-template-columns="1fr 0.5fr">
		<div
			class="range {isDragging ? 'dragging' : ''} "
			bind:this={node}
			on:mousedown={handleMouseDown}
		>
			<div
				class="handler"
				style="--position: {p1}; --opacity: {opacity};"
			/>
			<div class="filler" style="--p1: {p1}; --p2: {p2};"></div>
			<div
				class="handler"
				style="--position: {p2}; --opacity: {opacity};"
			/>
		</div>
		<div class="numbers">
			<NumberInput
				{label}
				{disabled}
				{context}
				{key}
				{suffix}
				{step}
				{min}
				{max}
				progress={false}
				bind:value={value[0]}
			/>
			<NumberInput
				{label}
				{disabled}
				{context}
				{key}
				{suffix}
				{step}
				{min}
				{max}
				progress={false}
				bind:value={value[1]}
			/>
		</div>
	</FieldInputRow>
</div>

<style>
	.interval-input {
		position: relative;
		width: 100%;
	}

	.range {
		position: relative;
		--padding-h: 3px;
		--space-between: 2px;

		--width: 6px;
		--tx-min-0: var(--padding-h);
		--tx-max-0: calc(
			100cqw - var(--padding-h) * 1 - var(--width) - var(--width) -
				var(--space-between)
		);
		--tx-min-1: calc(
			var(--padding-h) + var(--width) + var(--space-between)
		);
		--tx-max-1: calc(100cqw - var(--padding-h) * 1 - var(--width));

		height: var(--height-input);
		border-radius: var(--border-radius-input);
		box-shadow: inset 0 0 0 1px var(--color-border-input);

		background: var(--color-background-input);
		cursor: ew-resize;
		container-type: size;
	}

	.range:hover {
		box-shadow: inset 0 0 0 1px var(--color-active);
	}

	.range.dragging {
		box-shadow: 0 0 0 2px var(--color-active);
	}

	.handler {
		--tx: calc(
			var(--position, 0) * (var(--tx-max) - var(--tx-min)) / (1) +
				var(--tx-min)
		);
		position: absolute;
		z-index: 1;
		left: 0px;
		top: 3px;
		bottom: 3px;

		width: var(--width);

		background: grey;
		transform-origin: 0 50%;
		border-radius: calc(var(--border-radius-input) * 0.5);

		background-color: var(--color-active);

		transform: translate3d(var(--tx), 0px, 0px);

		opacity: var(--opacity, 1);
	}

	.handler:first-child {
		--tx-min: var(--tx-min-0);
		--tx-max: var(--tx-max-0);
	}

	.handler:last-child {
		--tx-min: var(--tx-min-1);
		--tx-max: var(--tx-max-1);
	}

	.filler {
		--size: calc(
			100% - var(--padding-h) - var(--width) - var(--space-between) -
				var(--width) * 0.5 - var(--padding-h) - var(--width) * 0.5
		);
		position: absolute;
		/* z-index: 4; */
		top: 3px;
		left: calc(
			var(--padding-h) + var(--width) * 0.5 + var(--p1) * var(--size)
		);
		right: calc(
			var(--padding-h) + var(--width) * 0.5 + (1 - var(--p2)) *
				var(--size)
		);
		bottom: 3px;
		background-color: var(--color-active);
		opacity: 0.5;

		transform-origin: 0px 50%;
	}

	.numbers {
		display: grid;
		column-gap: var(--column-gap);

		grid-template-columns: 0.5fr 0.5fr;
	}
</style>
