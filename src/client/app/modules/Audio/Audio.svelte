<script>
	import { onMount } from 'svelte';
	import Field from '../../ui/Field.svelte';
	import FieldGroup from '../../ui/FieldGroup.svelte';
	import Module from '../../ui/Module.svelte';
	import ButtonInput from '../../ui/fields/ButtonInput.svelte';
	import FieldInputRow from '../../ui/fields/FieldInputRow.svelte';
	import NumberInput from '../../ui/fields/NumberInput.svelte';
	import Select from '../../ui/fields/Select.svelte';
	import { audio, audioSettings, resync, tap } from './audio.js';

	let container, canvas, context;
	let pixelRatio;

	onMount(() => {
		pixelRatio = window.devicePixelRatio;
		canvas.width = container.offsetWidth * pixelRatio;
		canvas.height = container.offsetHeight * pixelRatio;

		context = canvas.getContext('2d');

		drawBackground();
		drawBar();
	});

	const drawBackground = () => {
		if (!canvas) return;

		const { beatsPerMeasure } = $audioSettings;

		const width = canvas.width;
		const height = canvas.height;
		context.clearRect(0, 0, width, height);

		const barCount = beatsPerMeasure * 4;

		for (let i = 1; i < barCount; i++) {
			let x = i * (width / barCount);

			if (i % beatsPerMeasure === 0) {
				x -= 1;
				context.lineWidth = 2 * pixelRatio;
				context.strokeStyle = 'black';
			} else {
				context.lineWidth = 0.5 * pixelRatio;
				context.strokeStyle = '#030303';
			}

			// context.strokeStyle = 'black';
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, height);
			context.stroke();
		}
	};

	const getRectForBar = (barIndex, measureIndex) => {
		const { beatsPerMeasure } = $audioSettings;

		let t = barIndex + measureIndex * beatsPerMeasure;

		if (t < 0) {
			t = 4 * beatsPerMeasure - 1;
		}

		const barWidth = canvas.width / ($audioSettings.beatsPerMeasure * 4);
		const barHeight = canvas.height;

		const fillWidth = barWidth - 20;
		const fillHeight = 3 * pixelRatio;

		let x = t * barWidth;
		x += barWidth * 0.5 - fillWidth * 0.5;
		x = Math.round(x);
		let y = 3 * pixelRatio;

		return [x, y, fillWidth, fillHeight];
	};

	const drawBar = () => {
		if (!canvas) return;

		const { beatsPerMeasure } = $audioSettings;

		context.fillStyle = '#177bd0';

		for (let i = 0; i < beatsPerMeasure * 4; i++) {
			const bar = i % beatsPerMeasure;
			const measure = Math.floor(i / beatsPerMeasure);
			context.clearRect(...getRectForBar(bar, measure));
		}

		context.beginPath();
		context.roundRect(...getRectForBar($audio.bar, $audio.measure), 3);
		context.fill();
	};

	audioSettings.subscribe(() => {
		drawBackground();
		drawBar();
	});

	audio.subscribe(() => {
		drawBar();
	});

	$: bars = new Array($audioSettings.beatsPerMeasure)
		.fill()
		.map((v, index) => ({
			active: $audio.bar === index,
		}));
</script>

<Module name="Audio">
	<div class="canvas-container" bind:this={container}>
		<canvas class="canvas" bind:this={canvas}></canvas>
	</div>
	<Field
		key="time"
		value={$audioSettings.beatsPerMeasure}
		on:change={(e) => {
			$audioSettings.beatsPerMeasure = e.detail;
		}}
		params={{
			options: [
				{ label: '2/4', value: 2 },
				{ label: '3/4', value: 3 },
				{ label: '4/4', value: 4 },
			],
		}}
	/>
	<Field key="bpm" value={$audioSettings.bpm} step={0.01} />
	<FieldInputRow --grid-template-columns="1fr 1fr 1fr 1fr 1fr 1fr">
		<Field
			params={{ label: '-' }}
			displayName={null}
			value={() => {
				$audioSettings.bpm -= 1;
			}}
		/>
		<Field
			params={{ label: '+' }}
			displayName={null}
			value={() => {
				$audioSettings.bpm += 1;
			}}
		/>
		<Field
			params={{ label: '↤' }}
			displayName={null}
			value={() => {
				$audio.bar -= 1;
			}}
		/>
		<Field
			params={{ label: '↦' }}
			displayName={null}
			value={() => {
				$audio.bar += 1;
			}}
		/>

		<Field
			params={{ label: '/2' }}
			displayName={null}
			value={() => {
				$audioSettings.bpm /= 2;
			}}
		/>
		<Field
			params={{ label: '*2' }}
			displayName={null}
			value={() => {
				$audioSettings.bpm *= 2;
			}}
		/>
	</FieldInputRow>
	<FieldInputRow --grid-template-columns="1fr 1fr 1fr">
		<Field
			key="tap"
			displayName={null}
			params={{ label: 'tap' }}
			value={() => {
				tap();
			}}
		/>
		<Field
			key="resync"
			displayName={null}
			params={{ label: 'resync' }}
			value={() => {
				resync();
			}}
		/>
		<Field
			key="pause"
			displayName={null}
			params={{ label: 'pause' }}
			value={() => {
				// pause();
			}}
		/>
	</FieldInputRow>
</Module>

<style>
	.visualizer {
		display: grid;
		grid-template-columns: var(--grid-template-columns);
		column-gap: var(--column-gap);
	}
	.temp {
		position: relative;
		height: var(--height-input);
		background-color: var(--color-background-input);
		border: 1px solid var(--color-border-input);
		border-radius: var(--border-radius-input);
	}

	.temp:before {
		content: '';

		position: absolute;
		top: 3px;
		left: 3px;
		right: 3px;
		bottom: 3px;

		background-color: var(--color-active);
		border-radius: calc(var(--border-radius-input) * 0.5);

		opacity: 0.2;
	}

	.temp.active:before {
		opacity: 0.5;
	}

	.canvas-container {
		position: relative;
		padding: 3px 0px 3px 12px;
		width: 100%;
		height: 100px;
	}

	.canvas {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: var(--border-radius-input);
		border: 1px solid var(--color-border-input);
		background-color: var(--color-background-input);
	}
</style>
