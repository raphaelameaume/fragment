<script>
	import ButtonInput from './ButtonInput.svelte';
	import ColorInput from './ColorInput.svelte';
	import NumberInput from './NumberInput.svelte';

	let { value, disabled = false, onchange } = $props();

	/** @type {HTMLCanvasElement | undefined} */
	let canvas = $state();
	let stopIndex = $state(0);

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

	function handleChange() {
		let stops = sortedStops.map((stop) => ({
			position: stop.position,
			color: stop.color,
		}));

		onchange(stops);
	}
</script>

<div class="gradient-input">
	<div class="input-container">
		<div class="gradient-container" class:disabled>
			<div
				class="gradient"
				style="--fragment-gradient-bkg-color: {gradient}"
			></div>
			{#each value as stop}
				<button
					class="gradient-grab"
					style="--x: {stop.position *
						100}; --fragment-gradient-grab-bkg-color: {stop.color}"
				>
					<span class="visually-hidden"></span>
				</button>
			{/each}
		</div>
		<div class="gradient-stop-add">
			<ButtonInput
				label="+"
				onclick={() => {
					let position = 0;

					if (value.length === 2) {
						let prevPosition = value[0]?.position ?? 0;
						let nextPosition = value[1].position;
						position =
							(nextPosition - prevPosition) * 0.5 + prevPosition;
					}

					sortedStops.push({ position, color: '#ff0000' });
					handleChange();
				}}
			/>
		</div>
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
</div>

<style>
	.gradient-input {
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
		align-items: center;
	}

	.gradient-container {
		position: relative;

		display: flex;
		height: var(--fragment-input-height);
		margin: 2px 0;

		gap: var(--column-gap);

		container-type: inline-size;
	}

	.gradient {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: var(--fragment-input-border-radius);
		background: var(--fragment-gradient-bkg-color);
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);
		border-radius: calc(var(--fragment-input-border-radius) - 1px);
		cursor: cell;
	}

	.gradient-grab {
		--size: 4px;
		--flow: 1px;
		position: absolute;
		top: calc(var(--flow) * -1);
		left: calc(var(--size) * -0.5);
		left: -1px;

		width: var(--size);
		height: calc(100% + var(--flow) * 2);

		background-color: var(--fragment-gradient-grab-bkg-color);

		transform: translateX(max(0px, calc(var(--x) * (1cqw) - 2px)));
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
