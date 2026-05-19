<script>
	import { tick } from 'svelte';
	import { draggable } from '@fragment/attachments/draggable';
	import ButtonInput from './ButtonInput.svelte';
	import ColorInput from './ColorInput.svelte';
	import NumberInput from './NumberInput.svelte';
	import IconFlip from '@fragment/components/IconFlip.svelte';

	import { map, clamp, roundToStep } from '../../utils/math.utils';
	import SelectChevrons from '../SelectChevrons.svelte';
	import KeyBinding from '@fragment/components/KeyBinding.svelte';
	import Keyboard from '@fragment/inputs/Keyboard';
	import Layout from '../Layout.svelte';
	import {
		componentsToFormat,
		getColorFormat,
		toComponents,
	} from '@fragment/utils/color.utils';
	import { SvelteMap } from 'svelte/reactivity';

	let { value, disabled = false, onchange } = $props();

	/** @type {HTMLCanvasElement | undefined} */
	let canvas = $state();
	/** @type {GradientStop | undefined} */
	let activeStopIndex = $state(-1);
	/** @type {boolean} */
	let isOpen = $state(true);
	/** @type {string} */
	let gradientLabel = $derived(isOpen ? 'Add new stop' : 'Edit gradient');
	/** @type {boolean} */
	let dragging = $state(false);
	/** @type {number} */
	let draggingStopIndex = $state(-1);
	let lastStopIndex = $state(0);
	let focusedKey = $state(null);
	let t;

	/** @typedef GradientStop
	 * @property {number} position
	 * @property {string} color
	 */

	let g = $state([
		{ position: 0, color: '#ff0000'},
		{ position: 0.49, color: '#ffff00'},
		{ position: 0.5, color: '#ff00ff'},
		{ position: 1, color: '#0000ff'},
	]);

	let needsRefocus = $state(false);

	let keys = new Map();

	/** @type {GradientStop[]} */
	let sortedStops = $derived.by(() => {
		return value.map((stop, index) => {
			const { position, color } = stop;

			return {
				position,
				color,
				index,
			}
		}).sort((a, b) => {
			// Sort by position
			if (a.position !== b.position) {
				return a.position - b.position;
			}
			// maintain original order if positions are equal
			return a.index - b.index;
		}).map((stop, sortIndex) => {
			stop.sortIndex = sortIndex;

			return stop;
		});
	});

	let ids = $derived(sortedStops.length > 0 ? [...mapIds.values()] : []);
	let inputs = $state([]);

	let lastSortIndex = null;

	let gradient = $derived.by(() => {
		let stops = sortedStops
			.map(({ position, color }) => {
				return `${color} ${position * 100}%`;
			})
			.join(',');

		return `linear-gradient( 90deg, ${stops})`;
	});

	/** @type {DOMRect | undefined} */
	let parentRect;

	/**
	 *
	 * @param {MouseEvent} event
	 * @param {object} params
	 * @param {GradientStop} stop
	 * @param {HTMLElement} params.node
	 */
	function onGradientDragStart(event, { rect, node }, stopIndex) {
		dragging = true;
		draggingStopIndex = stopIndex;
		lastStopIndex = stopIndex;

		const { parentElement } = node;

		if (parentElement) {
			parentRect = parentElement.getBoundingClientRect();
		}
	}

	/**
	 *
	 * @param {MouseEvent} event
	 * @param {object} params
	 * @param {GradientStop} stop
	 */
	function onGradientDrag(event, params, stopIndex) {
		let position = clamp(
			map(event.clientX, parentRect.left, parentRect.right, 0, 1),
			0,
			1,
		);

		let stop = sortedStops.find((s) => s.index === stopIndex);

		if (stop) {
			stop.position = position;
			handleChange();
		}
	}

	function onGradientDragEnd() {
		dragging = false;
		draggingStopIndex = -1;
		handleChange();
	}

	/**
	 *
	 * @param {PointerEvent} event
	 */
	function addStop(event) {
		let position = 0;
		let color = '#ff000';

		if (event.pointerType === 'mouse') {
			const rect = event.target.getBoundingClientRect();
			const t = map(event.clientX, rect.left, rect.right, 0, 1);
			position = t;

			let [prevStop, nextStop] = getStopsAt(position);

			color = getColorAt(
				clamp(map(position, prevStop.position, nextStop.position, 0, 1), 0, 1),
				prevStop.color,
				nextStop.color,
			);

			sortedStops.push({ position, color, index: sortedStops.length });
			handleChange();
		} else {
			addStopFromLast();
		}
	}

	function getColorAt(position, colorStart, colorEnd) {
		const [r0, g0, b0] = toComponents(colorStart);
		const [r1, g1, b1] = toComponents(colorEnd);


		const r = map(position, 0, 1, r0, r1);
		const g = map(position, 0, 1, g0, g1);
		const b = map(position, 0, 1, b0, b1);

		const format = getColorFormat(colorStart);
		const color = componentsToFormat([r, g, b], format);

		return color;
	}

	/**
	 *
	 * @param {number} position
	 * @returns {[GradientStop, GradientStop]}
	 */
	function getStopsAt(position) {
		let prevStopIndex = 0;

		if (sortedStops.length > 1) {
			for (let i = 1; i < sortedStops.length; i++) {
				if (position > sortedStops[i].position) {
					prevStopIndex = i;
				}
			}
		}

		let prevStop = sortedStops[prevStopIndex];
		let nextStop = sortedStops[prevStopIndex + 1] ?? prevStop;

		return [prevStop, nextStop];
	}

	function addStopFromLast() {
		let position = 0;
		let color = '#ff0000';

		if (lastStopIndex >= 0) {
			let lastStop = sortedStops.find((s) => s.index === lastStopIndex);
			let lastPosition = lastStop.position;
			let lastSortedStopIndex = sortedStops.findIndex(
				(s) => s === lastStop,
			);

			if (sortedStops.length === 1) {
				position = lastPosition < 0.5 ? 1 : 0;
			}

			if (sortedStops.length >= 2) {
				let prevIndex =
					sortedStops.length === 2
						? 0
						: lastSortedStopIndex < sortedStops.length - 1
							? lastSortedStopIndex
							: lastSortedStopIndex - 1;
				let nextIndex = prevIndex + 1;

				let prevStop = sortedStops[prevIndex];
				let nextStop = sortedStops[nextIndex] ?? prevStop;
				let prevPosition = prevStop.position;
				let nextPosition = nextStop.position;
				position = (nextPosition - prevPosition) * 0.5 + prevPosition;
				color = getColorAt(
					map(position, prevPosition, nextPosition, 0, 1),
					prevStop.color,
					nextStop.color,
				);
			}
		}

		sortedStops.push({ position, color, index: sortedStops.length });
		handleChange();
	}

	function handleChange() {
		sortedStops.forEach((s) => {
			if (!value[s.index]) {
				value[s.index] = {};
			}

			value[s.index].position = s.position;
			value[s.index].color = s.color;
		});

		onchange($state.snapshot(value));
	}

	/**
	 *
	 * @param {KeyboardEvent} event
	 * @param {number} direction
	 */
	function onKeyDown(event, direction) {
		if (
			event.target?.classList?.contains('gradient-grab') &&
			activeStopIndex >= 0 &&
			activeStopIndex < value.length
		) {
			const diff = Keyboard.getStepFromEvent(event);
			let stop = value[activeStopIndex];
			let position = clamp(
				stop.position + (diff * direction) / 100,
				0,
				1,
			);
			stop.position = position;
			handleChange();
		}
	}

	function handleClickGradient(event) {
		event.preventDefault();

		if (!isOpen) {
			isOpen = true;
		} else {
			addStop(event);
		}
	}

	function flip(event) {
		event.preventDefault();

		value.forEach((stop) => {
			stop.position = 1 - stop.position;
		});

		onchange($state.snapshot(value));
	}
</script>

<div class="gradient-input" class:extended={isOpen}>
	<div class="input-container">
		<div class="gradient-container" class:disabled>
			<button
				class="gradient"
				class:opened={isOpen}
				style="--fragment-gradient-bkg-color: {gradient}"
				onclick={handleClickGradient}
			>
				<span class="visually-hidden">{gradientLabel}</span>
			</button>
			{#if isOpen}
				{#each sortedStops as { position, color, index, id, key }, i (index)}
					<button
						class="gradient-grab"
						class:dragging={dragging &&
							draggingStopIndex === index}
						style="--x: {position}; --fragment-gradient-grab-bkg-color: {color}"
						onfocus={() => {
							activeStopIndex = index;
							lastStopIndex = index;
						}}
						onblur={() => {
							activeStopIndex = -1;
						}}
						{@attach draggable({
							onDragStart: (event, params) => {
								onGradientDragStart(event, params, index);
							},
							onDrag: (event, params) => {
								onGradientDrag(event, params, index);
							},
							onDragEnd: () => {
								onGradientDragEnd();
							},
						})}
					>
						<span class="visually-hidden">Drag</span>
					</button>
				{/each}
			{/if}
		</div>
		<div class="gradient-edit">
			<ButtonInput
				label="open"
				showLabel={false}
				onclick={(event) => {
					event.preventDefault();
					isOpen = !isOpen;
				}}
			>
				<SelectChevrons width={20} />
			</ButtonInput>
		</div>
	</div>
	{#if isOpen}
		<div class="subgrid">
		<div class="gradient-actions">
			<ButtonInput label="flip" onclick={flip} showLabel={false}>
				<IconFlip angle="90deg"/>
			</ButtonInput>
			<div class="gradient-stop-add">
				<ButtonInput label="+" onclick={addStopFromLast}  />
			</div>
		</div>
			{#each sortedStops as stop, i (stop.sortIndex)}
				{@const { position, color, index, id, sortIndex } = stop}
				<div class="gradient-stop">
					<NumberInput
						bind:node={inputs[sortIndex]}
						value={position * 100}
						suffix="%"
						step={1}
						shouldFocus={focusedKey === stop.key}
						onchange={(v) => {
							const position = clamp(v / 100, 0, 1);
							const prevPosition = stop.position;

							const currentSortIndex = sortIndex;
							const clone = sortedStops.map((s) => {
								return {
									index: s.index,
									position: s.index === index ? position : s.position,
								}
							});

							clone.sort((a, b) => {
								// Sort by position
								if (a.position !== b.position) {
									return a.position - b.position;
								}
								// maintain original order if positions are equal
								return a.index - b.index;
							})

							const newSorted = clone.map((stop, sortIndex) => {
								stop.sortIndex = sortIndex;

								return stop;
							});

							const newSortIndex = newSorted.find((s) => s.index === index).sortIndex;
							const orderIsChanging = currentSortIndex !== newSortIndex && prevPosition !== position;

								stop.position = position;

							if (orderIsChanging) {
								tick().then(() => {
									inputs[newSortIndex].focus();
								});
							}

							handleChange();

							lastStopIndex = index;
						}}
					/>
					<ColorInput
						value={color}
						onchange={(c) => {
							stop.color = c;
							lastStopIndex = index;
							handleChange();
						}}
					/>
					<div class="gradient-stop-delete">
						<ButtonInput
							label="-"
							disabled={value.length === 1}
							onclick={() => {
								if (lastStopIndex === value.length - 1) {
									lastStopIndex -= 1;
								}

								const baseIndex = stop.index;
								value.splice(baseIndex, 1);

								const index = sortedStops.indexOf(stop);

								sortedStops.splice(index, 1);
								handleChange();
							}}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<KeyBinding
	key="ArrowLeft"
	type="down"
	onTrigger={(event) => onKeyDown(event, -1)}
/>
<KeyBinding
	key="ArrowUp"
	type="down"
	onTrigger={(event) => onKeyDown(event, 1)}
/>
<KeyBinding
	key="ArrowDown"
	type="down"
	onTrigger={(event) => onKeyDown(event, -1)}
/>
<KeyBinding
	key="ArrowRight"
	type="down"
	onTrigger={(event) => onKeyDown(event, 1)}
/>

<style>
	.gradient-input {
		--grab-height: 16px;

		position: relative;
		width: 100%;

		display: flex;
		flex-direction: column;
		row-gap: var(--column-gap);
	}

	.input-container {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--column-gap);
		align-items: start;
		margin: 2px 0;
	}

	.gradient-container {
		position: relative;

		display: flex;

		gap: var(--column-gap);

		border-radius: var(--fragment-input-border-radius);
		container-type: inline-size;
	}

	.gradient {
		position: relative;
		width: 100%;
		height: var(--fragment-input-height);

		cursor: pointer;
		background: var(--fragment-gradient-bkg-color);
		border-radius: calc(var(--fragment-input-border-radius));
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);
		outline: 0;
	}

	.gradient:focus-visible {
		box-shadow: inset 0 0 0 2px var(--fragment-accent-color);
	}

	.gradient-input.extended {
		.gradient {
			cursor: cell;
		}
	}

	.gradient-input:not(.extended) .gradient-edit :global(svg) {
		transform: rotate(-90deg);
	}

	.gradient-grab {
		--size: 8px;
		--flow: 1px;
		--container-width: calc(100 * 1cqw - 1px);
		position: absolute;
		top: calc(var(--fragment-input-height) + var(--column-gap) - 1px);
		left: calc(1px - var(--size) * 0.5);
		/*left: -1px;*/

		width: var(--size);
		height: var(--grab-height);

		background-color: var(--fragment-gradient-grab-bkg-color);

		transform: translateX(calc(var(--x) * (var(--container-width))));
		border-radius: var(--fragment-input-border-radius);

		cursor: grab;
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);
		outline: 0;
		/*border: 2px solid var(--fragment-accent-color);*/

		/*&:before {
			content: '';
			position: absolute;
			inset: 0;

			border: 1px solid var(--fragment-input-border-color);
		}*/
	}

	:global(body:not(.fragment-dragging)) .gradient-grab:not(.disabled):hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	.gradient-grab.dragging,
	:global(body:not(.fragment-dragging))
		.gradient-grab:not(.disabled):focus-visible {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
	}

	.gradient-input.extended .gradient-actions {
		margin-top: calc(var(--grab-height));
	}

	.subgrid {
		display: grid;
		grid-template-columns: 1fr 4fr auto;
		column-gap: var(--column-gap);
	}

	.gradient-actions {
		display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1; /* spans all 3 columns */
	}

	.gradient-stop-add {
		grid-column: 2 / -1;
	}

	.gradient-stop {
		display: grid;
	  grid-template-columns: subgrid;
  align-items: center;
	  grid-column: 1 / -1;
	}

	:global(body:not(.fragment-dragging)) .gradient:not(.disabled):hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}
</style>
