<div class="preview" bind:this={preview}>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
.preview {
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
        stage.instance.update();
        stage.instance.render();

        context.clearRect(0, 0, width, height);
        context.drawImage(stage.instance.gl.canvas, 0, 0);
    }
    requestAnimationFrame(update);
}

</script>