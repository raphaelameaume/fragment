<div class="output" bind:this={element}></div>

<script>
import { onMount } from "svelte";
// props
export let renderer;
export let stages;

// variables
let element;

onMount(() => {
    element.appendChild(renderer.canvas);
});

</script>

<style>
.output {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    background-color: black;
}
</style>