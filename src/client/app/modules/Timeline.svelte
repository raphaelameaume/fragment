<script context="module">
	import { writable } from 'svelte/store';

	export const timeline = writable([]);

	let ID = 0;
</script>

<script>
	import { onMount, onDestroy } from 'svelte';
	import { sketches } from '../stores/sketches.js';
	import { monitors } from '../stores/rendering';
	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import ModuleHeaderAction from '../ui/ModuleHeaderAction.svelte';
	import { props } from '../stores/props';
	import ButtonInput from '../ui/fields/ButtonInput.svelte';
	import Select from '../ui/fields/Select.svelte';
	import NumberInput from '../ui/fields/NumberInput.svelte';
	import ProgressInput from '../ui/fields/ProgressInput.svelte';
	import { map } from '../utils/math.utils.js';

	export let mID;
	export let hasHeader = true;

	let id = ID++;
	let selected = id;
	let sketch, sketchKey;

	let padding = 20;

	let duration = 30.28;
	let framerate = 60;
	let currentTime = 1.5;
	let totalFrames = Math.floor(framerate * duration);
	$: currentFrame = `${Math.floor(framerate * currentTime)}`.padStart(
		totalFrames.toString().length,
		'0',
	);

	function formatTime(time) {
		let displayDurationMinutes = `${Math.floor(time / 60)}`.padStart(
			2,
			'0',
		);
		let displayDurationSeconds = `${Math.floor(
			time - displayDurationMinutes,
		)}`.padStart(2, '0');
		let displayDurationMilliseconds = `${Math.round(
			(time - displayDurationSeconds) * 100,
		)}`.padStart(2, '0');

		return `${displayDurationMinutes}:${displayDurationSeconds}:${displayDurationMilliseconds}`;
	}

	$: displayDuration = formatTime(duration);
	$: displayTime = formatTime(currentTime);

	let zoomMin = 0.25;
	let zoomMax = 4;
	let zoomLevel = 1;

	let timelineDuration = Math.ceil(duration);

	$: stepCount = timelineDuration;

	$: steps = [...Array(stepCount)].fill().map((_, index) => {
		const label = index === 0 || index === duration ? index : `${index}s`;

		return {
			index,
			label,
		};
	});

	$: timelineSteps = [...Array(stepCount + 1)].fill().map((_, index) => {
		const label = `${index}`;

		return {
			index,
			label,
		};
	});
	$: sequences = [
		{ name: 'Main', startTime: 0, endTime: duration, events: [] },
		{ name: 'Intro', startTime: 0, endTime: 10, events: [] },
		{ name: 'Brand', startTime: 10, endTime: 20, events: [] },
	];

	function handleClickTimeline(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left - padding;

		const relativeX = x / (rect.width - padding * 2);

		currentTime = relativeX * duration;
	}
</script>

<Module {mID} {hasHeader} name={`Timeline`} slug="timeline">
	<div slot="header-right">
		<!-- {#if options.length > 1}
			<ModuleHeaderAction
				value={selected}
				permanent
				border
				on:change={(event) => (selected = event.detail)}
				{options}
			/>
		{/if} -->
	</div>
	<div
		class="timeline-module"
		style="--duration: {duration}; --zoom-level: {zoomLevel}; --timeline-padding: {padding}px; --timeline-steps: {steps.length}"
	>
		<header class="header">
			<div class="current-time">
				<div class="current-seconds">
					{displayTime}/{displayDuration}
				</div>
				<div class="current-frames">
					{currentFrame}/{totalFrames}
				</div>
				<!-- <div class="speed">
					<Select value="1x" options={['1x', '2x', '4x']} />
				</div> -->
			</div>
			<div class="actions">
				<ButtonInput label="Prev frame" showLabel={false}>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						color="#000000"
						stroke-width="1.5"
						><path
							d="M6 7V17"
							stroke="var(--color-text-input)"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path><path
							d="M17.0282 5.2672C17.4217 4.95657 18 5.23682 18 5.73813V18.2619C18 18.7632 17.4217 19.0434 17.0282 18.7328L9.09651 12.4709C8.79223 12.2307 8.79223 11.7693 9.09651 11.5291L17.0282 5.2672Z"
							fill="var(--color-text-input)"
							stroke="var(--color-text-input)"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path></svg
					>
				</ButtonInput>
				<ButtonInput label="Pause" showLabel={false}>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						color="#000000"
						stroke-width="1.5"
						><path
							d="M6.90588 4.53682C6.50592 4.2998 6 4.58808 6 5.05299V18.947C6 19.4119 6.50592 19.7002 6.90588 19.4632L18.629 12.5162C19.0211 12.2838 19.0211 11.7162 18.629 11.4838L6.90588 4.53682Z"
							fill="var(--color-text-input)"
							stroke="var(--color-text-input)"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path></svg
					>
				</ButtonInput>
				<ButtonInput label="Next frame" showLabel={false}>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						color="#000000"
						stroke-width="1.5"
						><path
							d="M18 7V17"
							stroke="var(--color-text-input)"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path><path
							d="M6.97179 5.2672C6.57832 4.95657 6 5.23682 6 5.73813V18.2619C6 18.7632 6.57832 19.0434 6.97179 18.7328L14.9035 12.4709C15.2078 12.2307 15.2078 11.7693 14.9035 11.5291L6.97179 5.2672Z"
							fill="var(--color-text-input)"
							stroke="var(--color-text-input)"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path></svg
					>
				</ButtonInput>
			</div>
			<div class="zoom">
				<ProgressInput
					min={0}
					max={1}
					value={map(zoomLevel, zoomMin, zoomMax, 0, 1)}
					step={0.1}
					on:change={(e) =>
						(zoomLevel = map(e.detail, 0, 1, zoomMin, zoomMax))}
				/>
			</div>
		</header>
		<div class="container" style="--step-count: {stepCount}">
			<div class="left">
				<ul class="list">
					{#each sequences as sequence}
						<li class="list-item">
							<h4 class="sequence-title">{sequence.name}</h4>
						</li>
					{/each}
				</ul>
			</div>
			<div class="timeline-container">
				<div
					class="timeline"
					on:click={handleClickTimeline}
					role="button"
				>
					<div class="time">
						<div
							class="sequencer-overlay sequencer-overlay-start"
						></div>
						<div
							class="sequencer-overlay sequencer-overlay-end"
						></div>
						<div class="timesteps">
							{#each timelineSteps as timestep}
								<div class="timestep">
									<div class="timestep-label">
										{timestep.label}
									</div>
								</div>
							{/each}
						</div>
						<div class="timeframe">
							<button class="timeframe-limit"></button>
							<button class="timeframe-limit"></button>
						</div>
					</div>
					<div class="sequencer">
						<div class="sequencer-background">
							<div class="columns">
								{#each steps as timestep}
									<div class="column"></div>
								{/each}
							</div>
						</div>
						<div class="sequences">
							{#each sequences as sequence}
								<div
									class="sequence"
									style="--position-start: {(sequence.startTime /
										timelineDuration) *
										100}%; --position-end: {(sequence.endTime /
										timelineDuration) *
										100}%;"
								>
									<div class="sequence-fill"></div>
								</div>
							{/each}
						</div>
					</div>

					<div class="current" style="--x: {currentTime / duration}">
						<!-- <svg
							width="13"
							viewBox="0 0 159 212"
							class="svg"
							version="1.1"
							><path
								d="M17.0234375,1.07763419 L143.355469,1.07763419 C151.63974,1.07763419 158.355469,7.79336295 158.355469,16.0776342 L158.355469,69.390507 C158.355469,73.7938677 156.420655,77.9748242 153.064021,80.8248415 L89.3980057,134.881757 C83.7986799,139.635978 75.5802263,139.635978 69.9809005,134.881757 L6.66764807,81.1243622 C3.0872392,78.0843437 1.0234375,73.6246568 1.0234375,68.9277387 L1.0234375,17.0776342 C1.0234375,8.2410782 8.1868815,1.07763419 17.0234375,1.07763419 Z"
								fill="var(--color-active)"
							></path></svg
						> -->
					</div>
				</div>
			</div>
		</div>
		{#if sketch}
			<Field
				key="framerate"
				value={isFinite(sketch.duration) ? sketch.duration : NaN}
				disabled
			/>
		{/if}
	</div>
</Module>

<style>
	.timeline-module {
		--sequence-row-height: 36px;
		--sequence-fill-height: 32px;
		--timestep-width: calc(100px * var(--zoom-level));
		--timeline-padding: 20px;

		position: relative;
	}

	.header,
	.container {
		position: relative;

		padding: 4px;
	}

	.current-time {
		display: flex;
		align-items: flex-end;
		font-size: 14px;
		gap: 18px;
	}

	.current-seconds {
		font-size: 14px;
	}

	.current-frames {
		/* font-size: 11px; */
	}

	.container {
		display: grid;
		grid-template-columns: 100px auto;
	}

	.timeline-container {
		overflow-x: scroll;

		border-radius: 0px var(--border-radius-input) var(--border-radius-input)
			var(--border-radius-input);
		border: 1px solid var(--color-lightblack);
		/* box-shadow: inset 0 0 0 1px var(--color-border-input); */
	}

	.timeline {
		position: relative;

		width: calc(
			var(--timestep-width) * (var(--step-count)) +
				var(--timeline-padding) * 2
		);
	}

	.timeline-container::-webkit-scrollbar {
		height: 5px; /* width of the entire scrollbar */
	}

	.timeline-container::-webkit-scrollbar-track {
		background-color: var(
			--color-lightblack
		); /* color of the tracking area */
	}

	.timeline-container::-webkit-scrollbar-thumb {
		background-color: var(--color-active); /* color of the scroll thumb */
		border-radius: 20px; /* roundness of the scroll thumb */
	}

	.header {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		align-items: center;
		gap: 4px;
	}

	.actions {
		--height-input: 30px;
		display: grid;
		grid-template-columns: repeat(3, var(--height-input));
		justify-content: center;
		column-gap: 4px;
	}

	.sequencer {
		position: relative;

		width: 100%;
		/* grid-template-columns: repeat(var(--step-count), var(--timestep-width)); */
		height: auto;

		padding: 8px 0;

		background: var(--color-background-input);
	}

	.sequences {
		display: grid;
		grid-template-columns: 1fr;
		grid-auto-rows: var(--sequence-row-height);
		padding: 0 var(--timeline-padding);
	}

	.sequence {
		display: flex;
		align-items: center;

		height: var(--sequence-row-height);
	}

	.current-time {
		color: var(--color-text-input);
	}

	.zoom {
		max-width: 75px;
		--height-input: 18px;
	}

	.time {
		position: relative;
		padding: 0 var(--timeline-padding);
		border-bottom: 1px solid #3a3a3a;
		background-color: #1d1d1e;
	}

	.timesteps {
		display: grid;

		grid-template-columns: repeat(
			calc(var(--step-count) + 1),
			var(--timestep-width)
		);
	}

	.timestep {
		position: relative;

		display: flex;
		padding: 16px 0 8px;

		&:before {
			content: '';

			position: absolute;
			left: 0;
			top: 0;

			width: 1px;
			height: 12px;

			background-color: #3a3a3a;
		}

		&:after {
			content: '';

			position: absolute;
			left: 50%;
			top: 0;

			width: 1px;
			height: 6px;

			background-color: #3a3a3a;
		}
	}

	.timestep:last-child {
		width: var(--timeline-padding);
	}

	.timestep-label {
		color: var(--color-text-input);
		font-size: var(--font-size-input);
		transform: translateX(-50%);
	}

	.timeframe {
		position: relative;
		width: calc(var(--timestep-width) * (var(--duration)));

		height: 6px;
		margin-bottom: 6px;

		background-color: rgba(255, 255, 255, 0.2);
	}

	.speed {
		width: 40px;
	}

	.timeframe-limit {
		position: absolute;
		top: -1px;
		left: -2px;
		bottom: -1px;

		width: 5px;

		background-color: var(--color-active);
		border-radius: 2px;

		&:nth-child(2) {
			left: initial;
			right: -2px;
		}
	}

	.sequence-fill {
		position: relative;
		/* width: 100%; */
		height: var(--sequence-fill-height);

		width: calc(var(--position-end) - var(--position-start) + 1px);
		margin-left: var(--position-start);

		border-radius: calc(var(--border-radius-input));
		background-color: #4a4a4b;
		border: 1px solid var(--color-border-input);
	}

	.sequencer-background {
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		padding: 0 var(--timeline-padding);
	}

	.columns {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(calc(var(--step-count)), 1fr);
		height: 100%;
	}

	.column {
		height: 100%;
		border-left: 1px solid #3a3a3a;

		&:last-child {
			border-right: 1px solid #3a3a3a;
		}
	}

	.current {
		position: absolute;
		left: calc(var(--timeline-padding));
		top: 0;

		width: 1px;
		height: 100%;

		background-color: var(--color-active);

		transform: translate3d(
			calc(var(--x) * var(--timestep-width) * var(--timeline-steps)),
			0%,
			0
		);
	}

	.current .svg {
		position: absolute;
		top: 0;
		left: -6px;
	}

	.sequencer-overlay {
		position: absolute;
		top: 0;
		bottom: 0;

		height: 100%;
		width: calc(var(--timeline-padding) * 1);

		background-color: rgba(0, 0, 0, 0.5);
	}

	.sequencer-overlay-start {
		left: 0;
	}

	.sequencer-overlay-end {
		right: 0;
	}

	.list {
		padding: 60px 0 8px;
		border-top: 1px solid var(--color-border-input);
		border-left: 1px solid var(--color-border-input);
		border-bottom: 1px solid var(--color-border-input);

		border-radius: var(--border-radius-input) 0px 0px
			var(--border-radius-input);
	}

	.list-item {
		display: flex;
		padding: 0 6px;
		align-items: center;
		height: calc(var(--sequence-row-height));
	}

	.sequence-title {
		position: relative;

		height: var(--sequence-fill-height);
		display: flex;
		align-items: center;
		width: 100%;
		padding-left: 12px;
		color: var(--color-text-input);
		font-size: var(--font-size-input);
		/* border: 1px solid var(--color-border-input);
		border-radius: var(--border-radius-input); */

		&:after {
			content: '';

			position: absolute;
			top: 0;
			bottom: 0;
			right: 0;

			width: 4px;
			height: 100%;

			border-radius: calc(var(--border-radius-input));
			background-color: #4a4a4b;
			border: 1px solid var(--color-border-input);
		}
	}
</style>
