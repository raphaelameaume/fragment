<script>
import { onMount } from "svelte";
import Module from "../ui/Module.svelte";
import { current as currentRendering } from "../stores/rendering.js";

export let name = "monitor";

let container;
let canvas;

if ($currentRendering.monitors === 0) {
    onMount(() => {
        let index = $currentRendering.monitors;
        
        $currentRendering.monitors += 1;

        if ($currentRendering.monitors === 1 && index === 0) {
            canvas = $currentRendering.canvas;
        }

        canvas.style.width = '100%';

        container.appendChild(canvas);
    });
}

</script>

<Module name={name}>
    <div class="canvas__container" bind:this={container}>
    </div>
</Module>

<style>

</style>
