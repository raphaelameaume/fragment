<main>
	{#if output}
	<Output
		renderer={renderer}
		stages={stages}
	/>
	{:else if single}
	<Single
		renderer={renderer}
		stages={stages}
	/>
	{:else}
	<Controller
		renderer={renderer}
		stages={stages}
		output={output}
	/>
	{/if}
</main>

<script>
import Controller from "./Controller.svelte";
import Output from "./Output.svelte";
import Single from "./Single.svelte";

// props
export let renderer = {};
export let stages = {};
export let output = false;
export let single = false;

$: dimensions = renderer.dimensions;

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