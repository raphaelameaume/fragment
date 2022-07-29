<script>
import Field from "../ui/Field.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import Module from "../ui/Module.svelte";
import Spectrum from "./AudioAnalyser/Spectrum.svelte";

</script>

<Module name="Audio Analyser">
	<Field
		key="source"
		value="microphone"
		params={{ options: ["microphone", "audioplayer"]}}
	/>
	<Field key="spectrum">
		<Spectrum range={10} rows={7} />
	</Field>
	<FieldGroup name="global">
		<Field key="decay" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
		<Field key="hold" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
		<Field key="min" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
	</FieldGroup>
	<FieldGroup name="channel 1" collapsed>
		<Field key="decay" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
		<Field key="hold" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
		<Field key="min" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
	</FieldGroup>
	<FieldGroup name="channel 2" collapsed>
		<Field key="decay" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
		<Field key="hold" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
		<Field key="min" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
	</FieldGroup>
	<FieldGroup name="channel 3" collapsed>
		<Field key="decay" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
		<Field key="hold" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
		<Field key="min" value={0.5} params={{min: 0, max: 1, step: 0.01}} />
	</FieldGroup>
</Module>
