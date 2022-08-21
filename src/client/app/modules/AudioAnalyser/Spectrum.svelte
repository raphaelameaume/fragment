<script>
import Range from "./Range.svelte";
import { audioAnalysis } from "../../stores/audioAnalysis";

$: ranges = audioAnalysis.getRanges();

</script>

<div class="spectrum" style={`grid-template-columns: repeat(${ranges.length}, 1fr)`}>
	{#each ranges as r, rangeIndex }
		<Range rowCount={12} index={rangeIndex} />
	{/each}
</div>

<style>
.spectrum {
	position: relative;

	display: grid;
	column-gap: 3px;
	width: 100%;
	aspect-ratio: 3 / 1;
	grid-template-columns: repeat(10, 1fr);
	padding: 0 3px;

	border-radius: var(--border-radius-input);
    background-color: var(--color-background-input);
    box-shadow: inset 0 0 0 1px var(--color-border-input);
}

</style>
