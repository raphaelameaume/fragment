<div class="output">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
.output {
    top: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
}

canvas {
    width: 100%;
}
</style>

<script>
import { onMount } from "svelte";
import { on } from "../events.js";

export let renderer;

let canvas;
let context;

onMount(() => {
    canvas.width = renderer.dimensions.width;
    canvas.height = renderer.dimensions.height;

    context = canvas.getContext('2d');

    on('afterframe', update);
});

function update() {
    renderer.render();

    context.clearRect(0, 0, canvas.width, canvas.height);
    // context.fillStyle = '#0000ff';
    context.drawImage(renderer.gl.canvas, 0, 0);
}

</script>