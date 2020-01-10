<main>
	<Controller
		renderer={renderer}
		stages={stages}
	/>
</main>

<script>
import Controller from "./Controller.svelte";

// props
export let renderer = {};
export let stages = {};
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