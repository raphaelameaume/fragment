<script>
	import { SIZES, monitors } from '../stores/rendering.js';
	import { rendering } from '../state/rendering.svelte';
	// import { sketchesCosketchesCountunt } from '../stores/sketches.js';
	import Field from './Field.svelte';
	import presets, {
		PRESET_ORIENTATIONS,
		getDimensionsForPreset,
	} from '../lib/presets';
	import { exports } from '../stores';
	import ParamsMultisampling from './ParamsMultisampling.svelte';
	import Select from './fields/Select.svelte';
	import FieldInputRow from './fields/FieldInputRow.svelte';

	let canvasWidth = rendering.current.width;
	let canvasHeight = rendering.current.height;

	function handleChangeDimensions([width, height]) {
		const needsUpdate = canvasWidth !== width || canvasHeight !== height;

		if (needsUpdate) {
			canvasWidth = width;
			canvasHeight = height;

			rendering.current.width = width;
			rendering.current.height = height;
		}
	}

	let sizes = Object.values(SIZES);
	let dimensions = $derived([rendering.current.width, rendering.current.height]);
	let dimensionsEnabled = $derived([SIZES.FIXED, SIZES.SCALE].includes(
		rendering.current.resizing,
	));

	$effect(() => {
		if (rendering.current.resizing === SIZES.PRESET) {
			const { preset } = rendering;current.
			const [width, height] = getDimensionsForPreset(preset, {
				pixelsPerInch: 300,
				orientation: rendering.current.presetOrientation,
			});

			rendering.current.width = width;
			rendering.current.height = height;
		}
	})
</script>

<Field
	key="dimensions"
	value={dimensions}
	onchange={handleChangeDimensions}
	params={{
		step: 1,
		suffix: 'px',
		locked: false,
	}}
	disabled={!dimensionsEnabled}
/>
<Field
	key="canvasSize"
	value={rendering.current.resizing}
	onchange={(resizing) => {
		if (resizing === SIZES.ASPECT_RATIO) {
			// compute aspect ratio based on previous props
			rendering.current.aspectRatio = rendering.current.width / rendering.current.height;
		}

		$exports.pixelsPerInch = resizing === SIZES.PRESET ? 300 : 72;
		rendering.current.resizing = resizing;
	}}
	params={{
		options: sizes,
	}}
/>
{#if rendering.current.resizing === SIZES.ASPECT_RATIO}
	<Field
		key="aspectRatio"
		value={rendering.current.aspectRatio}
		onchange={(aspectRatio) => {
			rendering.current.aspectRatio = aspectRatio;
		}}
		params={{
			step: 0.01,
		}}
	/>
{/if}
{#if rendering.current.resizing === SIZES.SCALE}
	<Field
		key="zoom"
		value={rendering.current.scale}
		onchange={(event) => {
			rendering.current.scale = event;
		}}
		params={{
			step: 0.01,
		}}
	/>
{/if}
{#if rendering.current.resizing === SIZES.PRESET}
	<Field key="preset">
		<FieldInputRow --grid-template-columns="1fr 1fr">
			<Select
				value={rendering.current.preset}
				options={presets}
				on:change={(event) => {
					rendering.current.preset = event.detail;
				}}
			/>
			<Select
				value={rendering.current.presetOrientation}
				options={[
					PRESET_ORIENTATIONS.PORTRAIT,
					PRESET_ORIENTATIONS.LANDSCAPE,
				]}
				on:change={(event) => {
					rendering.current.presetOrientation = event.detail;
				}}
			/>
		</FieldInputRow>
	</Field>
{/if}

{#if rendering.resizing !== SIZES.PRESET}
	<Field
		key="pixelRatio"
		value={Number(rendering.current.pixelRatio)}
		onchange={(pixelRatio) => (rendering.current.pixelRatio = pixelRatio)}
		params={{
			step: 0.1,
		}}
	/>
{/if}
<!-- {#if $sketchesCount > 1 && $monitors.length > 1}
	<ParamsMultisampling />
{/if} -->
