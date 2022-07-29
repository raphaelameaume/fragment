<script>
import Range from "./Range.svelte";

export let range = 10;
export let rows = 8;

const ranges = [];

for (let i = 0; i < range; i++) {
	ranges.push({});
}

</script>


<div class="spectrum" style={`grid-template-columns: repeat(${range}, 1fr)`}>
	{#each ranges as r }
		<Range count={rows} />
	{/each}
	<div class="split" style="left: 33%"></div>
	<div class="split" style="left: 75%"></div>
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

.split {
	position: absolute;
	top: 0;
	bottom: 0;

	width: 1px;
	left: 33%;

	background-color: rgba(255, 255, 255, 0.2);
}

</style>
