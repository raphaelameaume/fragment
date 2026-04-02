<script>
	import { draggable } from '@fragment/attachments/draggable';
	import ButtonInput from './ButtonInput.svelte';
	import ColorInput from './ColorInput.svelte';
	import NumberInput from './NumberInput.svelte';

	import { map, clamp, roundToStep } from '../../utils/math.utils';
	import SelectChevrons from '../SelectChevrons.svelte';

	let { value, disabled = false, onchange } = $props();

	/** @type {HTMLCanvasElement | undefined} */
	let canvas = $state();
	let stopIndex = $state(0);
	let isOpen = $state(true);
	let gradientLabel = $derived(isOpen ? 'Add new stop' : 'Edit gradient');

	/** @typedef GradientStop
	 * @property {number} position
	 * @property {string} color
	 */

	/** @type {GradientStop[]} */
	let sortedStops = $derived(
		[...value].sort((a, b) => (a.position < b.position ? -1 : 1)),
	);

	let gradient = $derived.by(() => {
		let stops = sortedStops
			.map(({ position, color }) => {
				return `${color} ${position * 100}%`;
			})
			.join(',');

		return `linear-gradient(in oklab 90deg, ${stops})`;
	});

	/** @type {DOMRect | undefined} */
	let parentRect;
	let positionStart = -1;
	let coordStart = -1;

	/**
	 *
	 * @param {GradientStop} stop
	 * @param {MouseEvent} event
	 * @param {object} params
	 * @param {HTMLElement} params.node
	 */
	function onGradientDragStart(stop, event, { rect, node }) {
		const { parentElement } = node;

		if (parentElement) {
			parentRect = parentElement.getBoundingClientRect();
			positionStart = stop.position;
			coordStart = event.clientX;
		}
	}

	function onGradientDrag(stop, event) {
		console.log(`onDrag`);
		let position = clamp(
			map(event.clientX, parentRect.left, parentRect.right, 0, 1),
			0,
			1,
		);

		stop.position = position;
	}

	/**
	 *
	 * @param {PointerEvent} event
	 */
	function addStop(event) {
		console.log(event);

		let position = 0;

		if (value.length === 2) {
			let prevPosition = value[0]?.position ?? 0;
			let nextPosition = value[1].position;
			position = (nextPosition - prevPosition) * 0.5 + prevPosition;
		}

		sortedStops.push({ position, color: '#ff0000' });
		handleChange();
	}

	function handleChange() {
		let stops = sortedStops.map((stop) => ({
			position: stop.position,
			color: stop.color,
		}));

		onchange(stops);
	}

	function handleClickGradient(event) {
		event.preventDefault();

		if (!isOpen) {
			isOpen = true;
		} else {
			addStop(event);
		}
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
				{#each value as stop}
					<button
						class="gradient-grab"
						style="--x: {stop.position}; --fragment-gradient-grab-bkg-color: {stop.color}"
						{@attach draggable({
							onDragStart: (event, params) => {
								onGradientDragStart(stop, event, params);
							},
							onDrag: (event, params) => {
								onGradientDrag(stop, event, params);
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
		<div class="gradient-stop-add">
			<ButtonInput label="+" onclick={addStop} />
		</div>
		<div class="gradient-stops">
			{#each sortedStops as stop, index}
				<div class="gradient-stop">
					<NumberInput
						value={stop.position * 100}
						suffix="%"
						step={1}
						onchange={(v) => (stop.position = v / 100)}
					/>
					<ColorInput
						value={stop.color}
						onchange={(c) => {
							stop.color = c;
							stopIndex = index;
						}}
					/>
					<div class="gradient-stop-delete">
						<ButtonInput
							label="-"
							disabled={value.length === 1}
							onclick={() => {
								if (value.length > index) {
									stopIndex = index;
								} else {
									stopIndex = 0;
								}

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

	:global(body:not(.fragment-dragging))
		.gradient-grab:not(.disabled):focus-within {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
	}

	.gradient-input.extended .gradient-stop-add {
		margin-top: calc(var(--grab-height));
	}

	.gradient-stop {
		display: grid;
		grid-template-columns: 1fr 4fr auto;
		align-items: center;
		column-gap: var(--column-gap);
	}

	:global(body:not(.fragment-dragging)) .gradient:not(.disabled):hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}
</style>
