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

	let { id = layout.getID(), headless = false } = $props();

	const LABEL_RECORD = 'start';
	const LABEL_RECORDING = 'stop';

	let recordLabel = $derived(
		exports.recording ? LABEL_RECORDING : LABEL_RECORD,
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
				min: 1,
				max: 100,
				step: 1,
				suffix: '%',
				triggerable: false,
			}}
			onchange={(value) => {
				exports.videoQuality = value;
			}}
		/>
		<Field
			key="useDuration"
			value={exports.useDuration}
			onchange={(value) => {
				exports.useDuration = value;
			}}
		/>
		{#if exports.useDuration}
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
