<div class="preview" bind:this={preview} bind:offsetWidth={offsetWidth} style={`height: ${height}px`}>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
.preview {
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
import { onMount, afterUpdate, getContext } from "svelte";
import { on } from "../events.js";

// props
export let renderer;
export let stage;
export let dpr = renderer.dpr;

// variables
let canvas, preview;
let context;

let rendererWidth = renderer.dimensions.width;
let rendererHeight = renderer.dimensions.height;
let dimensions = getContext('rendererDimensions');

dimensions.subscribe( (value) => {
    rendererWidth = value.width;
    rendererHeight = value.height;
}); 

let offsetWidth;
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

    on('frame', () => {
        attachContext();
    })
});

function attachContext() {
    if (stage) {
        stage.context = context;
    }
}

</script>