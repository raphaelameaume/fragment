<script>
import { clamp } from "lemonade-math";
import { onMount, beforeUpdate, afterUpdate } from "svelte";
import Module from "../ui/Module.svelte";
import { current as currentRendering } from "../stores/rendering.js";

export let name = "monitor";
export let grow;

let container;
let canvas;

let index;
let offsetWidth, offsetHeight;

$: {
    if (container) {
        if (index === $currentRendering.monitors - 1) {
            canvas = $currentRendering.canvas;
        } else if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = offsetWidth;
            canvas.height = offsetWidth * $currentRendering.height / $currentRendering.width;

            // @TODO
            // create canvas
            // register canvas
        }

        canvas.style.cssText = `
            max-width: 100%;
            max-height: 100%;
        `;

        if (!canvas.parentNode) {
            container.appendChild(canvas);
        }
    }
}

if ($currentRendering.monitors === 0) {
    onMount(() => {
        index = $currentRendering.monitors;
        $currentRendering.monitors += 1;
    });
}

</script>

<Module name={name} grow={grow}>
    <div class="canvas__container" bind:this={container} bind:offsetWidth={offsetWidth} bind:offsetHeight={offsetHeight}>
    </div>
</Module>

<style>
.canvas__container {
    position: relative;
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;

    background-color: #0E0E0E;
}
</style>
