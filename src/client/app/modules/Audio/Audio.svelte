<script>
	import { onMount } from 'svelte';
	import Field from '../../ui/Field.svelte';
	import Module from '../../ui/Module.svelte';
	import FieldInputRow from '../../ui/fields/FieldInputRow.svelte';

	import {
		SOURCE_TYPES,
		audio,
		audioSettings,
		fft,
		resync,
		tap,
	} from './audio.js';
	import Audio from '../../inputs/Audio.js';
	import FieldSpace from '../../ui/FieldSpace.svelte';

	let containerFFT, canvasFFT, contextFFT;
	let containerBPM, canvasBPM, contextBPM;
	let pixelRatio;

	let devices = [];

	onMount(async () => {
		pixelRatio = window.devicePixelRatio;

		canvasBPM.width = containerBPM.offsetWidth * pixelRatio;
		canvasBPM.height = containerBPM.offsetHeight * pixelRatio;
		contextBPM = canvasBPM.getContext('2d');

		canvasFFT.width = containerFFT.offsetWidth * pixelRatio;
		canvasFFT.height = containerFFT.offsetHeight * pixelRatio;
		contextFFT = canvasFFT.getContext('2d');

		drawBackground();
		drawBar();

		devices = await Audio.listDevices();
	});

	const drawBackground = () => {
		if (!canvasBPM) return;

		const { beatsPerMeasure } = $audioSettings;

		const width = canvasBPM.width;
		const height = canvasBPM.height;
		contextBPM.clearRect(0, 0, width, height);

		const barCount = beatsPerMeasure * 4;

		for (let i = 1; i < barCount; i++) {
			let x = i * (width / barCount);

			if (i % beatsPerMeasure === 0) {
				x -= 1;
				contextBPM.lineWidth = 2 * pixelRatio;
				contextBPM.strokeStyle = 'black';
			} else {
				contextBPM.lineWidth = 1 * pixelRatio;
				contextBPM.strokeStyle = '#101010';
			}

			// contextBPM.strokeStyle = 'black';
			contextBPM.beginPath();
			contextBPM.moveTo(x, 0);
			contextBPM.lineTo(x, height);
			contextBPM.stroke();
		}
	};

	const getRectForBar = (barIndex, measureIndex) => {
		const { beatsPerMeasure } = $audioSettings;

		let t = barIndex + measureIndex * beatsPerMeasure;

		if (t < 0) {
			t = 4 * beatsPerMeasure - 1;
		}

		const barWidth = canvasBPM.width / ($audioSettings.beatsPerMeasure * 4);
		const barHeight = canvasBPM.height;

		const fillWidth = Math.round(barWidth - 8 * pixelRatio);
		const fillHeight = Math.round(barHeight - 8 * pixelRatio);

		let x = t * barWidth;
		x += barWidth * 0.5 - fillWidth * 0.5;
		x = Math.round(x);
		let y = Math.round(canvasBPM.height * 0.5 - fillHeight * 0.5);

		return [x, y, fillWidth, fillHeight];
	};

	const drawBar = () => {
		if (!canvasBPM) return;

		const { beatsPerMeasure } = $audioSettings;

		contextBPM.fillStyle = '#177bd0';

		for (let i = 0; i < beatsPerMeasure * 4; i++) {
			const bar = i % beatsPerMeasure;
			const measure = Math.floor(i / beatsPerMeasure);
			contextBPM.clearRect(...getRectForBar(bar, measure));
		}

		contextBPM.beginPath();
		contextBPM.roundRect(...getRectForBar($audio.bar, $audio.measure), 3);
		contextBPM.fill();
	};

	audioSettings.subscribe(() => {
		drawBackground();
		drawBar();
	});

	audio.subscribe(() => {
		drawBar();
	});

	const { bufferLength } = Audio;

	fft.subscribe((data) => {
		if (!canvasFFT) return;

		contextFFT.clearRect(0, 0, canvasFFT.width, canvasFFT.height);

		let barWidth = (canvasFFT.width / bufferLength) * 1.5;

		for (var i = 0, x = 0; i < bufferLength; i++) {
			let barHeight = (data[i] / 256.0) * canvasFFT.height;

			let r = barHeight + 25 * (i / bufferLength);
			let g = 250 * (i / bufferLength);
			let b = 50;

			contextFFT.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
			contextFFT.fillRect(
				x,
				canvasFFT.height - barHeight,
				barWidth,
				barHeight,
			);

			x += barWidth + 2;
		}
	});

	$: bars = new Array($audioSettings.beatsPerMeasure)
		.fill()
		.map((v, index) => ({
			active: $audio.bar === index,
		}));
</script>

<Module name="Audio">
	<Field key="bpm" value={$audioSettings.bpm} step={0.01} />
	<FieldSpace />
	<Field key="bpm" displayName={null}>
		<div class="container container-bpm" bind:this={containerBPM}>
			<canvas class="canvas" bind:this={canvasBPM}></canvas>
		</div>
		<FieldSpace />
	</Field>
	<div class="bpm-visualizer">
		<FieldInputRow></FieldInputRow>
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
	<FieldSpace />
	<Field key="fft" displayName={null}>
		<div class="container" bind:this={containerFFT}>
			<canvas class="canvas" bind:this={canvasFFT}></canvas>
		</div>
		<FieldSpace />
	</Field>
	<Field
		key="source"
		value={$audioSettings.sourceType}
		params={{
			options: [
				{ label: 'none', value: undefined },
				...devices.map((device) => ({
					label: device.label,
					value: device.deviceId,
				})),
			],
		}}
		on:change={(e) => {
			$audioSettings.sourceType = e.detail;
		}}
	/>
	<Field
		key="gain"
		value={Audio.master.gain.value * 100}
		params={{ min: 0, max: 100, step: 1 }}
		on:change={(e) => {
			Audio.master.gain.value = e.detail / 100;
		}}
	/>
</Module>

<style>
	.container {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 0.4;
	}

	.canvas {
		width: 100%;
		height: 100%;
		border-radius: var(--border-radius-input);
		border: 1px solid var(--color-border-input);
		background-color: var(--color-background-input);
	}

	.bpm-visualizer {
		padding: 3px 6px 0px 12px;
	}

	.container-bpm {
		height: var(--height-input);
	}
</style>
