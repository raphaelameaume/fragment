<div class="output" bind:offsetWidth={offsetWidth} style={`height: ${height}px`}>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
.output {
    top: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: black;
}

canvas {
    max-width: 100%;
    max-height: 100%;
}
</style>

<script>
import { onMount, getContext } from "svelte";
import { on } from "../events.js";
import { rendererDimensions, currentStages } from "../store.js";

export let renderer;
export let dpr = renderer.dpr;

let canvas;
let context;
let offsetWidth;

let rendererWidth = renderer.dimensions.width;
let rendererHeight = renderer.dimensions.height;

// let dimensions = getContext('rendererDimensions');
rendererDimensions.subscribe( (value) => {
    rendererWidth = value.width;
    rendererHeight = value.height;
}); 

let stage1;
let stage2;
currentStages.subscribe((value) => {
    stage1 = value.stage1;
    stage2 = value.stage2;
});

$: height = window.innerHeight * offsetWidth / window.innerWidth;
$: canvasWidth = offsetWidth * dpr;
$: canvasHeight = (rendererHeight * offsetWidth / rendererWidth) * dpr;
$: {
    if (canvas) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        context = canvas.getContext('2d');
    }
}

onMount(() => {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context = canvas.getContext('2d');

    on('afterframe', update);
});

function update({ deltaTime, time }) {
    if (stage1 && stage2) {
        renderer.render(stage1, stage2, { deltaTime, time });
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(renderer.canvas, 0, 0, canvas.width, canvas.height);
}

</script>