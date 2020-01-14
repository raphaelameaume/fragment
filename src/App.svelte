<main>
	{#if !output}
	<Controller
		renderer={renderer}
		stages={stages}
		midi={midi}
	/>
	{:else}
	<Output
		renderer={renderer}
		stages={stages}
	/>
	{/if}
</main>

<script>
import Controller from "./Controller.svelte";
import Output from "./Output.svelte";

// props
export let renderer = {};
export let stages = {};
export let midi = {};
export let output = false;

</script>

<style>
main {
	position: relative;

	display: flex;
	flex-direction: column;
	height: 100%;
	margin: 0 auto;

	overflow: hidden;
}
</style>