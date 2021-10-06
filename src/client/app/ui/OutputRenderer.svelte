<script>
import { onDestroy, onMount } from "svelte";
import { current as currentRendering } from "../stores/rendering.js";
import { transitions } from "../transitions/index";
import { on, PREVIEW_AFTER_UPDATE, PREVIEW_BEFORE_UPDATE, PREVIEW_MOUNT, TRANSITION_CHANGE } from "../events/index.js";

export let paused = false;

let container;
let _raf;

function render() {
    const { threshold, renderer } = $currentRendering;

    if (!paused) {
        console.log(renderer);
        renderer.update({ threshold });
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

<div class="output-renderer" bind:this={container}></div>

<style>
.output-renderer {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;

    background-color: #0E0E0E;
}

.output-renderer :global(canvas) {
    max-width: 100%;
    max-height: 100%;
    background: green;
}
</style>
