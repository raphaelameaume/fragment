<script>
import { getContext, onDestroy, onMount } from "svelte";
import { current as currentRendering, threshold } from "../stores/rendering.js";
import { transitions } from "../transitions/index";
import { on, PREVIEW_AFTER_UPDATE, PREVIEW_BEFORE_UPDATE, PREVIEW_MOUNT, TRANSITION_CHANGE } from "../events/index.js";

export let paused = false;

let container;
let _raf;

let renderer = getContext('renderer');

function render() {
    if (!paused) {
        renderer.update({ threshold: $threshold });
    }

    _raf = requestAnimationFrame(render);
}

onMount(() => {
    const { canvas } = $currentRendering;

    container.appendChild(canvas);

    render();
});

onDestroy(() => {
    const { canvas } = $currentRendering;

    canvas.parentNode.removeChild(canvas);

    cancelAnimationFrame(_raf);
});

</script>

<div class="output-renderer">
    <div class="canvas-container" bind:this={container} style="max-width: {$currentRendering.width}px;">
    
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
