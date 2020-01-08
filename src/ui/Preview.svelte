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
import { on } from "../events.js";

export let width;
export let height;
export let stage;
export let index;
export let renderer;

let canvas, preview;
let context;

console.log(renderer);
let renderTarget = renderer.renderTargets[index];

onMount(() => {
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');

    on('frame', update);
    on(`renderStage${index}`, render);
});

function update() {
    if (stage) {
        stage.instance.update();
        stage.instance.render({...renderer}, renderTarget);
    }
}

function render() {
    context.clearRect(0, 0, width, height);
    context.drawImage(stage.instance.gl.canvas, 0, 0);
}

</script>