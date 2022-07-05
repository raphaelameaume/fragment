<script>
import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import { exports } from "../stores";
import { IMAGE_ENCODINGS, recording, VIDEO_FORMATS } from "../stores/exports";

const LABEL_RECORD = "start";
const LABEL_RECORDING = "stop";

function record () {
	$recording = !$recording;
}

$: label = $recording ? LABEL_RECORDING : LABEL_RECORD;

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
			value={$exports.quality}
			params={{ step: 0.01, min: 0.01, max: 1 }}
			on:change={((e) => {
				$exports.quality = e.detail;
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
	</FieldGroup>
	<FieldGroup name="video">
		<Field
			key="framerate"
			value={$exports.framerate}
			on:change={((e) => {
				$exports.framerate = e.detail;

				console.log($exports.framerate);
			})}
		/>
		<Field
			key="format"
			value={$exports.videoFormat}
			params={{ options: Object.values(VIDEO_FORMATS) }}
			on:change={((e) => {
				$exports.videoFormat = e.detail;
			})}
		/>
		<Field
			key="quality"
			value={$exports.videoQuality}
			params={{ min: 1, max: 100, step: 1, suffix: "%" }}
			on:change={((e) => {
				$exports.videoQuality = e.detail;
			})}
		/>
		<Field
			key="useDuration"
			value={$exports.useDuration}
			on:change={((e) => {
				$exports.useDuration = e.detail;
			})}
		/>
		{#if $exports.useDuration }
		<Field
			key="loopCount"
			value={$exports.loopCount}
			params={{ step: 1 }}
			on:change={((e) => {
				$exports.loopCount = e.detail;
			})}
		/>
		{/if}
		<Field
			key="record"
			value={record}
			params={{ label }}
		/>
	</FieldGroup>
</Module>
