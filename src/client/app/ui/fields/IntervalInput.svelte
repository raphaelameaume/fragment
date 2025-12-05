<script>
	import FieldInputRow from './FieldInputRow.svelte';
	import NumberInput from './NumberInput.svelte';
	import { map, clamp, roundToStep } from '../../utils/math.utils';

	let {
		value = null,
		label,
		step = 1,
		suffix = '',
		min = -Infinity,
		max = Infinity,
		disabled = false,
		context,
		key,
		onchange,
	} = $props();

	/** @type {HTMLElement} */
	let node;
	/** @type {DOMRect}*/
	let rect;
	/** @type {boolean}*/
	let isDragging = $state(false);

	let proximityIndex = -1;

	/**
	 *
	 * @param {MouseEvent} event
	 */
	function handleMouseDown(event) {
		document.body.classList.add('fragment-dragging');

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		rect = node.getBoundingClientRect();

		isDragging = true;

		let dragValue = computeDrag(event);

		let abs0 = Math.abs(dragValue - value[0]);
		let abs1 = Math.abs(dragValue - value[1]);

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

			onchange(newValues);
		}
	}

	function handleMouseUp() {
		document.body.classList.remove('fragment-dragging');
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		isDragging = false;
	}

	function handleValueChange(index, newValue) {
		let newValues = [...value];
		newValues[index] = newValue;

		onchange(newValues);
	}

	$effect(() => {
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
	});

	let p1 = $derived(map(clamp(value[0], min, max), min, max, 0, 1));
	let p2 = $derived(map(clamp(value[1], min, max), min, max, 0, 1));
</script>

<div class="interval-input" class:disabled>
	<FieldInputRow --grid-template-columns="1fr 0.5fr">
		<div
			class="range"
			class:dragging={isDragging}
			bind:this={node}
			onmousedown={handleMouseDown}
		>
			<div class="handler" style="--position: {p1};" />
			<div class="filler" style="--p1: {p1}; --p2: {p2};"></div>
			<div class="handler" style="--position: {p2};" />
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
				value={value[0]}
				onchange={(event) => handleValueChange(0, event)}
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
				value={value[1]}
				onchange={(event) => handleValueChange(1, event)}
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

		height: var(--fragment-input-height);
		border-radius: var(--fragment-input-border-radius);
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);

		background: var(--fragment-input-background-color);
		cursor: ew-resize;
		container-type: size;
	}

	:global(body:not(.fragment-dragging)) .range:hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	.range.dragging {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
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
		border-radius: calc(var(--fragment-input-border-radius) * 0.5);

		background-color: var(--fragment-accent-color);

		transform: translate3d(var(--tx), 0px, 0px);
	}

	.handler:first-child {
		--tx-min: var(--tx-min-0);
		--tx-max: var(--tx-max-0);
	}

	.handler:last-child {
		--tx-min: var(--tx-min-1);
		--tx-max: var(--tx-max-1);
	}

	.interval-input.disabled .handler {
		background-color: var(--fragment-color-disabled);
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
		background-color: var(--fragment-accent-color);
		opacity: 0.5;

		transform-origin: 0px 50%;
	}

	.interval-input.disabled .filler {
		background-color: var(--fragment-color-disabled);
	}

	.numbers {
		display: grid;
		column-gap: var(--column-gap);

		grid-template-columns: 0.5fr 0.5fr;
	}
</style>
