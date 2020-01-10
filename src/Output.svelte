<div class="output" bind:this={element}>
</div>

<script>
import { onMount } from "svelte";
// props
export let renderer;
export let stages;

// reactive variables
$: treshold = window.treshold.value;

// variables
let element;

onMount(() => {
    element.appendChild(renderer.canvas);
})

</script>

<style>
.output {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
}
</style>