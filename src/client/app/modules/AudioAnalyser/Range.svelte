<script>
import { onDestroy, onMount } from "svelte";

import { audioAnalysis } from "../../stores/audioAnalysis";



export let rowCount = 10;
export let index;

let rows = Array(rowCount).fill({ node: null });
let range = audioAnalysis.getRange(index);

let offUpdate;

onMount(() => {
	offUpdate = audioAnalysis.onUpdate(() => {
		const { volume } = range;
		const count = rowCount * volume;

		const full = Math.floor(count);
		const temp = count - full;

		for(let i = rows.length - 1; i >= 0; i--) {
			const index = rows.length - i;
			const node = rows[i];

			if (index < full) {
				node.style.setProperty('--opacity', 1);
			} else {
				node.style.setProperty('--opacity', 0);
			}
		}
	});
});

onDestroy(() => {
	if (offUpdate) {
		offUpdate();
		offUpdate = null;
	}
});

</script>

<div class="range" style={`grid-template-rows: repeat(${rows.length}, 1fr)`}>
	{#each rows as row, i }
		<div class="row" bind:this={rows[i]}></div>
	{/each}
</div>

<style>
.range {
	position: relative;

	display: grid;
	row-gap: 2px;
	padding: 3px 0;
}

.range:not(:last-child):after {
	content: '';

	position: absolute;
	top: 0;
	right: -2px;
	bottom: 0;
	width: 1px;

	background-color: var(--color-border-input);
}

.row {
	position: relative;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 2px;
}

.row:before {
	content: "";

	position: absolute;
	top: 0;
	left: 0;
	
	width: 100%;
	height: 100%;
	
	background-color: var(--color-active);
	opacity: var(--opacity, 0);
	border-radius: 2px;
}
</style>
