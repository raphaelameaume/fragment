<script>
	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import FieldGroup from '../ui/FieldGroup.svelte';
	import { recording, capturing, IMAGE_ENCODINGS,
		VIDEO_FORMATS, exports } from '../state/exports.svelte';

	let { hasHeader = true } = $props();

	const LABEL_RECORD = 'start';
	const LABEL_RECORDING = 'stop';

	let recordLabel = $derived(recording.isActive ? LABEL_RECORDING : LABEL_RECORD);
	
</script>

<Module {hasHeader} name="exports">
	<FieldGroup name="image">
		<Field
			key="encoding"
			value={exports.imageEncoding}
			params={{ options: IMAGE_ENCODINGS }}
			on:change={(e) => {
				exports.imageEncoding = e.detail;
			}}
		/>
		<Field
			key="quality"
			value={exports.imageQuality}
			params={{ min: 1, max: 100, suffix: '%', triggerable: false }}
			on:change={(e) => {
				exports.imageQuality = e.detail;
			}}
		/>
		<Field
			key="pixelsPerInch"
			value={exports.pixelsPerInch}
			params={{ step: 1 }}
			on:change={(e) => {
				exports.pixelsPerInch = e.detail;
			}}
		/>
		<Field
			key="count"
			value={exports.imageCount || 1}
			params={{ step: 1 }}
			on:change={(e) => {
				exports.imageCount = e.detail;
			}}
		/>
		<Field
			key="screenshot"
			value={capturing.toggle}
			params={{ label: 'capture', triggerable: false }}
		/>
	</FieldGroup>
	<FieldGroup name="video">
		<Field
			key="framerate"
			value={exports.framerate}
			on:change={(e) => {
				exports.framerate = e.detail;
			}}
		/>
		<Field
			key="format"
			value={exports.videoFormat}
			params={{ options: Object.values(VIDEO_FORMATS) }}
			on:change={(e) => {
				exports.videoFormat = e.detail;
			}}
		/>
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
			on:change={(e) => {
				exports.videoQuality = e.detail;
			}}
		/>
		<Field
			key="useDuration"
			value={exports.useDuration}
			on:change={(e) => {
				exports.useDuration = e.detail;
			}}
		/>
		{#if exports.useDuration}
			<Field
				key="loopCount"
				value={exports.loopCount}
				params={{ step: 1 }}
				on:change={(e) => {
					exports.loopCount = e.detail;
				}}
			/>
		{/if}
		<Field
			key="record"
			value={recording.toggle}
			params={{ label: recordLabel, triggerable: false }}
		/>
	</FieldGroup>
</Module>
