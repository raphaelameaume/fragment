<script>
import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import { exports } from "../stores";
import { recording, capturing, IMAGE_ENCODINGS, VIDEO_FORMATS } from "../stores/exports";

const LABEL_RECORD = "start";
const LABEL_RECORDING = "stop";

function record () {
	$recording = !$recording;
}

function capture() {
	$capturing = !$capturing;
}

$: recordLabel = $recording ? LABEL_RECORDING : LABEL_RECORD;

</script>

<Module name="exports">
	<FieldGroup name="image">
		<Field
			key="encoding"
			value={$exports.imageEncoding}
			params={{ options: IMAGE_ENCODINGS }}
			on:change={((e) => {
				$exports.imageEncoding = e.detail;
			})}
		/>
		<Field
			key="quality"
			value={$exports.imageQuality}
			params={{ min: 1, max: 100, suffix: "%" }}
			on:change={((e) => {
				$exports.imageQuality = e.detail;
			})}
		/>
		<Field
			key="pixelsPerInch"
			value={$exports.pixelsPerInch}
			params={{ step: 1 }}
			on:change={((e) => {
				$exports.pixelsPerInch = e.detail;
			})}
		/>
		<Field
			key="screenshot"
			value={capture}
			params={{ label: "capture" }}
		/>
	</FieldGroup>
	<FieldGroup name="video">
		<Field
			key="framerate"
			name="Video export framerate"
			value={$exports.framerate}
			on:change={((e) => {
				$exports.framerate = e.detail;
			})}
		/>
		<Field
			key="format"
			value={$exports.videoFormat}
			name="Video export format"
			params={{ options: Object.values(VIDEO_FORMATS) }}
			on:change={((e) => {
				$exports.videoFormat = e.detail;
			})}
		/>
		<Field
			key="quality"
			name="Video export quality"
			value={$exports.videoQuality}
			params={{ min: 1, max: 100, step: 1, suffix: "%" }}
			on:change={((e) => {
				$exports.videoQuality = e.detail;
			})}
		/>
		<Field
			key="useDuration"
			name="Use sketch duration"
			value={$exports.useDuration}
			on:change={((e) => {
				$exports.useDuration = e.detail;
			})}
		/>
		{#if $exports.useDuration }
		<Field
			key="loopCount"
			name="Video export loop count"
			value={$exports.loopCount}
			params={{ step: 1 }}
			on:change={((e) => {
				$exports.loopCount = e.detail;
			})}
		/>
		{/if}
		<Field
			key="record"
			name={`${recordLabel} recording`}
			value={record}
			params={{ label: recordLabel }}
		/>
	</FieldGroup>
</Module>
