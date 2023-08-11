<script>
	import {
		rendering,
		SIZES,
		SIZES_VALUES,
		monitors,
		updateRendering,
	} from '../stores/rendering.js';
	import { sketchesCount } from '../stores/sketches.js';
	import Field from './Field.svelte';
	import presets from '../lib/presets';
	import { exports } from '../stores';
	import ParamsMultisampling from './ParamsMultisampling.svelte';

	let canvasWidth = $rendering.width;
	let canvasHeight = $rendering.height;

	function handleChangeDimensions(event) {
		const [width, height] = event.detail;
		const needsUpdate = canvasWidth !== width || canvasHeight !== height;

		if (needsUpdate) {
			canvasWidth = width;
			canvasHeight = height;

			updateRendering({ width, height });
		}
	}

	$: dimensionsEnabled = [SIZES.FIXED, SIZES.SCALE].includes(
		$rendering.resizing,
	);
</script>

<Field
	key="dimensions"
	value={[$rendering.width, $rendering.height]}
	on:change={handleChangeDimensions}
	params={{
		step: 1,
		suffix: 'px',
		locked: false,
	}}
	disabled={!dimensionsEnabled}
/>
<Field
	key="canvasSize"
	value={$rendering.resizing}
	on:change={(event) => {
		const resizing = event.detail;
		let aspectRatio = 1;

		if (resizing === SIZES.ASPECT_RATIO) {
			// compute aspect ratio based on previous props
			aspectRatio = $rendering.width / $rendering.height;
		}

		$exports.pixelsPerInch = resizing === SIZES.PRESET ? 300 : 72;

		updateRendering({
			resizing,
			aspectRatio,
		});
	}}
	params={{
		options: SIZES_VALUES,
	}}
/>
{#if $rendering.resizing === SIZES.ASPECT_RATIO}
	<Field
		key="aspectRatio"
		value={Number($rendering.aspectRatio)}
		on:change={(event) => {
			updateRendering({
				aspectRatio: Number(event.detail),
			});
		}}
		params={{
			step: 0.01,
		}}
	/>
{/if}
{#if $rendering.resizing === SIZES.SCALE}
	<Field
		key="zoom"
		value={Number($rendering.scale)}
		on:change={(event) => {
			updateRendering({
				scale: Number(event.detail),
			});
		}}
		params={{
			step: 0.01,
		}}
	/>
{/if}
{#if $rendering.resizing === SIZES.PRESET}
	<Field
		key="preset"
		value={$rendering.preset}
		on:change={(event) =>
			updateRendering({
				preset: event.detail,
			})}
		params={{
			options: presets,
		}}
	/>
{/if}

{#if $rendering.resizing !== SIZES.PRESET}
	<Field
		key="pixelRatio"
		value={Number($rendering.pixelRatio)}
		on:change={(event) =>
			updateRendering({ pixelRatio: Number(event.detail) })}
		params={{
			step: 0.1,
		}}
	/>
{/if}
{#if $sketchesCount > 1 && $monitors.length > 1}
	<ParamsMultisampling />
{/if}
