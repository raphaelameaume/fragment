<script>
	import { SIZES, monitors } from '../stores/rendering.js';
	import { rendering } from '../state/rendering.svelte';
	import Field from './Field.svelte';
	import presets, {
		PRESET_ORIENTATIONS,
		getDimensionsForPreset,
	} from '../lib/presets';
	import { exports } from '../stores';
	import ParamsMultisampling from './ParamsMultisampling.svelte';
	import Select from './fields/Select.svelte';
	import FieldInputRow from './fields/FieldInputRow.svelte';

	function handleChangeDimensions({ width, height }) {
		const needsUpdate =
			rendering.width !== width || rendering.height !== height;

		if (needsUpdate) {
			rendering.width = width;
			rendering.height = height;

			if (rendering.resizing === SIZES.FIXED) {
				rendering.fixedWidth = width;
				rendering.fixedHeight = height;
			}
		}
	}

	let sizes = Object.values(SIZES);
	let dimensions = $derived({
		width: rendering.width,
		height: rendering.height,
	});
	let dimensionsEnabled = $derived(
		[SIZES.FIXED, SIZES.SCALE].includes(rendering.resizing),
	);

	$effect(() => {
		if (rendering.resizing === SIZES.PRESET) {
			const { preset } = rendering;
			const [width, height] = getDimensionsForPreset(preset, {
				pixelsPerInch: 300,
				orientation: rendering.presetOrientation,
			});

			rendering.width = width;
			rendering.height = height;
		}

		if (rendering.resizing === SIZES.FIXED) {
			rendering.width = rendering.fixedWidth;
			rendering.height = rendering.fixedHeight;
		}
	});
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
	value={rendering.resizing}
	onchange={(resizing) => {
		$exports.pixelsPerInch = resizing === SIZES.PRESET ? 300 : 72;
		rendering.resizing = resizing;
	}}
	params={{
		options: sizes,
	}}
/>
{#if rendering.resizing === SIZES.ASPECT_RATIO}
	<Field
		key="aspectRatio"
		value={rendering.aspectRatio}
		onchange={(aspectRatio) => {
			rendering.aspectRatio = aspectRatio;
		}}
		params={{
			step: 0.01,
		}}
	/>
{/if}
{#if rendering.resizing === SIZES.SCALE}
	<Field
		key="zoom"
		value={rendering.scale}
		onchange={(event) => {
			rendering.scale = event;
		}}
		params={{
			step: 0.01,
		}}
	/>
{/if}
{#if rendering.resizing === SIZES.PRESET}
	<Field key="preset">
		<FieldInputRow --grid-template-columns="1fr 1fr">
			<Select
				value={rendering.preset}
				options={presets}
				on:change={(event) => {
					rendering.preset = event.detail;
				}}
			/>
			<Select
				value={rendering.presetOrientation}
				options={[
					PRESET_ORIENTATIONS.PORTRAIT,
					PRESET_ORIENTATIONS.LANDSCAPE,
				]}
				on:change={(event) => {
					rendering.presetOrientation = event.detail;
				}}
			/>
		</FieldInputRow>
	</Field>
{/if}

{#if rendering.resizing !== SIZES.PRESET}
	<Field
		key="pixelRatio"
		value={Number(rendering.pixelRatio)}
		onchange={(pixelRatio) => (rendering.pixelRatio = pixelRatio)}
		params={{
			step: 0.1,
		}}
	/>
{/if}
<!-- {#if $sketchesCount > 1 && $monitors.length > 1}
	<ParamsMultisampling />
{/if} -->
