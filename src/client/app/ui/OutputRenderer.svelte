<script>
import { onDestroy, onMount } from "svelte";
import { current as currentRendering } from "../stores/rendering.js";

export let paused = false;

let _raf;
let canvas;

function render() {
    if (!paused) {
        // render
    }

    _raf = requestAnimationFrame(render);
}

onMount(() => {
    render();
});

onDestroy(() => {
    cancelAnimationFrame(_raf);
});

</script>

<div class="output-renderer">
    <div class="canvas-container" style="max-width: {$currentRendering.width}px;">
        <canvas bind:this={canvas}></canvas>
    </div>
</div>

<style>
.output-renderer {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;

    background-color: var(--color-lightblack);
}

.output-renderer :global(canvas) {
    max-width: 100%;
    max-height: 100%;
    background: green;

    width: auto !important;
    height: auto !important;
}

.canvas-container {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    max-height: 100%;
}
</style>
