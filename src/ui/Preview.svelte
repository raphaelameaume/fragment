<div class="preview" bind:this={container} bind:offsetWidth={offsetWidth} style={`height: ${height}px`}>
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
import { beforeUpdate, getContext } from "svelte";

// props
export let renderer;
export let stage;
export let dpr = renderer.dpr;

// bindings
let canvas, container, offsetWidth;

// variables
let context;
let rendererWidth = renderer.dimensions.width;
let rendererHeight = renderer.dimensions.height;

let dimensions = getContext('rendererDimensions');
dimensions.subscribe( (value) => {
    rendererWidth = value.width;
    rendererHeight = value.height;
}); 

$: height = window.innerHeight * offsetWidth / window.innerWidth;
$: canvasWidth = offsetWidth * dpr;
$: canvasHeight = (rendererHeight * offsetWidth / rendererWidth) * dpr;
$:{ 
    if (canvas) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        context = canvas.getContext('2d');
    }

    if (stage && context) {
        stage.context = context;

        if (typeof stage.instance.onPreview === 'function') {
            stage.instance.onPreview({ container, canvas });
        }
    }
}

beforeUpdate( (props) => {
    console.log(props);

    console.log('beforeUpdate', stage.name);
})

</script>