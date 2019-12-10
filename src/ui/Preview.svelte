<div class="preview" bind:this={preview}>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
.preview {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;

    background-color: black;
}

canvas {
    width: 100%;
}
</style>

<script>
import { onMount } from "svelte";

export let width;
export let height;
export let stage;

let canvas, preview;
let context;

onMount(() => {
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');

    update();
});

function update() {
    if (stage) {
        stage.render();

        context.clearRect(0, 0, width, height);
        context.drawImage(stage.gl.canvas, 0, 0);
    }
    requestAnimationFrame(update);
}

</script>