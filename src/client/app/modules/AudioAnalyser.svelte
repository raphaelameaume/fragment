<script>
import Field from "../ui/Field.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import Module from "../ui/Module.svelte";
import Spectrum from "./AudioAnalyser/Spectrum.svelte";
import { audioAnalysis } from "../stores/audioAnalysis.js";
import { onDestroy, onMount } from "svelte";

onMount(() => {
	audioAnalysis.listen();
});

onDestroy(() => {
	audioAnalysis.stop();
})


function handleChangeDecay(event) {
	audioAnalysis.master.decay = event.detail;
}

function handleChangeHold(event) {
	audioAnalysis.master.hold = event.detail;
}

function handleChangeMin(event) {
	audioAnalysis.master.min = event.detail;
}

</script>

<Module name="Audio Analyser">
	<Field
		key="source"
		value="microphone"
		params={{ options: ["microphone", "audioplayer"]}}
	/>
	<Field key="spectrum">
		<Spectrum />
	</Field>
	<FieldGroup name="global">
		<Field key="decay" value={audioAnalysis.master.decay} params={{min: 0, max: 1, step: 0.01}} on:change={handleChangeDecay}/>
		<Field key="hold" value={audioAnalysis.master.hold} params={{min: 0, max: 1, step: 0.01}} on:change={handleChangeHold}/>
		<Field key="min" value={audioAnalysis.master.min} params={{min: 0, max: 1, step: 0.01}} on:change={handleChangeMin}/>
	</FieldGroup>
	{#if audioAnalysis.getRanges().length > 0}
		{#each audioAnalysis.getRanges() as range, rangeIndex }
			<FieldGroup name={`range ${range.start}-${range.end}`} collapsed key={rangeIndex}>
				<Field
					key="decay"
					value={range.decay}
					params={{min: 0, max: 1, step: 0.01}}
					on:change={(e) => range.decay = e.detail}
				/>
				<Field
					key="hold"
					value={range.hold}
					params={{min: 0, max: 1, step: 0.01}}
					on:change={(e) => range.hold = e.detail}
				/>
				<Field
					key="min"
					value={range.min}
					params={{min: 0, max: 1, step: 0.01}}
					on:change={(e) => range.min = e.detail}
				/>
			</FieldGroup>
		{/each}
	{/if}
</Module>
