<script>
	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import FieldGroup from '../ui/FieldGroup.svelte';
	import { layout } from '../state/layout.svelte';
	import {
		IMAGE_ENCODINGS,
		VIDEO_FORMATS,
		exports,
		getCodecsForFormat,
	} from '../state/exports.svelte';
	import { rendering } from '../state/rendering.svelte';

	let { id = layout.getID(), headless = false } = $props();

	const LABEL_RECORD = 'start';
	const LABEL_RECORDING = 'stop';

	let recordLabel = $derived(
		exports.recording ? LABEL_RECORDING : LABEL_RECORD,
	);

	let sketchDuration = $derived(
		rendering.renders.length === 1
			? rendering.renders[0].sketch.duration
			: undefined,
	);
</script>

<Module {id} {headless} name="exports">
	<FieldGroup
		name="image"
		collapsed={exports.imageCollapsed}
		onchange={(collapsed) => (exports.imageCollapsed = collapsed)}
	>
		<Field
			key="encoding"
			value={exports.imageEncoding}
			params={{ options: IMAGE_ENCODINGS }}
			onchange={(value) => {
				exports.imageEncoding = value;
			}}
		/>
		<Field
			key="quality"
			value={exports.imageQuality}
			params={{ min: 1, max: 100, suffix: '%', triggerable: false }}
			onchange={(value) => {
				exports.imageQuality = value;
			}}
		/>
		<Field
			key="pixelsPerInch"
			value={exports.pixelsPerInch}
			params={{ step: 1 }}
			onchange={(value) => {
				exports.pixelsPerInch = value;
			}}
		/>
		<Field
			key="count"
			value={exports.imageCount || 1}
			params={{ step: 1 }}
			onchange={(value) => {
				exports.imageCount = value;
			}}
		/>
		<Field
			key="screenshot"
			value={() => (exports.capturing = !exports.capturing)}
			params={{ label: 'capture', triggerable: false }}
		/>
	</FieldGroup>
	<FieldGroup
		name="video"
		collapsed={exports.videoCollapsed}
		onchange={(collapsed) => (exports.videoCollapsed = collapsed)}
	>
		<Field
			key="framerate"
			value={exports.framerate}
			onchange={(value) => {
				exports.framerate = value;
			}}
		/>
		<Field
			key="format"
			value={exports.videoFormat}
			params={{ options: Object.values(VIDEO_FORMATS) }}
			onchange={(value) => {
				exports.videoFormat = value;

				if (
					!getCodecsForFormat(exports.videoFormat).includes(
						exports.videoCodec,
					)
				) {
					exports.videoCodec = getCodecsForFormat(
						exports.videoFormat,
					)?.[0];
				}
			}}
		/>
		{#if [VIDEO_FORMATS.MKV, VIDEO_FORMATS.MP4, VIDEO_FORMATS.WEBM, VIDEO_FORMATS.MOV].includes(exports.videoFormat)}
			<Field
				key="codec"
				value={exports.videoCodec}
				params={{ options: getCodecsForFormat(exports.videoFormat) }}
				onchange={(value) => {
					exports.videoCodec = value;
				}}
			/>
		{/if}
		<Field
			key="quality"
			value={exports.videoQuality}
			params={{
				options: [
					{ value: 100, label: 'very high' },
					{ value: 80, label: 'high' },
					{ value: 60, label: 'medium' },
					{ value: 40, label: 'low' },
					{ value: 20, label: 'very low' },
				],
				triggerable: false,
			}}
			onchange={(value) => {
				exports.videoQuality = value;
			}}
		/>
		<Field
			key="realtime"
			value={exports.realtime}
			onchange={(value) => {
				exports.realtime = value;
			}}
		/>
		<Field
			key="durationSource"
			value={exports.durationSource}
			params={{ options: ['manual', 'custom', 'sketch'] }}
			onchange={(value) => {
				exports.durationSource = value;
			}}
			type="radio"
			displayName="duration"
		/>
		{#if exports.durationSource === 'custom' || exports.durationSource === 'sketch'}
			<Field
				key="duration"
				value={exports.durationSource === 'sketch'
					? (sketchDuration ?? 'undefined')
					: exports.duration}
				params={{ suffix: 's' }}
				disabled={exports.durationSource === 'sketch'}
				onchange={(value) => {
					if (exports.durationSource === 'custom') {
						exports.duration = value;
					}
				}}
				displayName="length"
			/>
		{/if}
		{#if exports.durationSource === 'custom' || (exports.durationSource === 'sketch' && sketchDuration !== undefined)}
			<Field
				key="loopCount"
				value={exports.loopCount}
				params={{ step: 1 }}
				onchange={(value) => {
					exports.loopCount = value;
				}}
			/>
		{/if}

		<Field
			key="record"
			value={() => (exports.recording = !exports.recording)}
			params={{ label: recordLabel, triggerable: false }}
		/>
	</FieldGroup>
</Module>
