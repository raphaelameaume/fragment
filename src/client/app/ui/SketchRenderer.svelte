<script>
import { onDestroy, onMount } from "svelte";
import { current as currentSketches } from "../stores/sketches.js";
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentTime } from "../stores/time.js";
import { proxyProps } from "../utils/props.js";
import { checkForTriggersDown, checkForTriggersMove, checkForTriggersUp, checkForTriggersClick } from "../triggers/Mouse.js";
import { emit, PREVIEW_AFTER_UPDATE, PREVIEW_BEFORE_UPDATE, PREVIEW_MOUNT } from "../events/index.js";

export let key;
export let index;
export let paused = false;

let framerate = 60;
let canvas;
let _raf;
let _key = key;
let _renderSketch = () => {};

let sketch, props;

function createSketch(key) {
    if (!key) return;

    sketch = $currentSketches[key];
    
    if (!sketch) return;

    props = proxyProps(sketch.props);

    framerate = sketch.fps ? sketch.fps : 60;

    const init = sketch.setup || sketch.init;
    const resize = sketch.resize || (() => {});
    const { width, height, pixelRatio } = $currentRendering;

    init({
        width,
        height,
        props,
    });

    resize({ width, height, pixelRatio });

    _renderSketch = createRenderLoop();

    _renderSketch();
}

function createRenderLoop() {
    const { width, height, pixelRatio, renderer } = $currentRendering;
    const draw = sketch.draw || sketch.update;

    let elapsed = 0;

    const context = canvas.getContext("2d");

    return ({ time = $currentTime.time, deltaTime = $currentTime.deltaTime } = {}) => {
        elapsed += deltaTime;

        if (elapsed >= ((1 / framerate) * 1000)) {
            draw({
                ...renderer,
                context,
                props,
                width: width * pixelRatio,
                height: height * pixelRatio,
                time,
                deltaTime,
            });
        }
    };
}

function render() {
    if (!paused) {
        emit(PREVIEW_BEFORE_UPDATE, { index, canvas });
        _renderSketch();
        emit(PREVIEW_AFTER_UPDATE, { index, canvas });
    }

    _raf = requestAnimationFrame(render);
}

$: {
    if (canvas && _key !== key) {
        _key = key;
        sketch = null;
        createSketch(key);
    }
}

currentRendering.subscribe((current) => {
    if (canvas && sketch) {
        sketch.resize({ 
            width: current.width,
            height: current.height,
            pixelRatio: current.pixelRatio,
        });
    }
});

onMount(() => {
    console.log("SketchRenderer :: mount", index);
    emit(PREVIEW_MOUNT, { index, canvas });

    createSketch(key);

    render();
})

onDestroy(() => {
    cancelAnimationFrame(_raf);
})

$: canvasWidth = $currentRendering.width * $currentRendering.pixelRatio;
$: canvasHeight = $currentRendering.height * $currentRendering.pixelRatio;

</script>

<div class="sketch-renderer">
    <div class="canvas-container" style="max-width: {$currentRendering.width}px;">
        <canvas class="canvas"
            width={canvasWidth}
            height={canvasHeight}
            bind:this={canvas}
            on:mousedown={(event) => checkForTriggersDown(event, key) }
            on:click={(event) => checkForTriggersClick(event, key) }
            on:mouseup={(event) => checkForTriggersUp(event, key) }
            on:mousemove={(event) => checkForTriggersMove(event, key) }
        ></canvas>
    </div>
</div>

<style>
.sketch-renderer {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;

    background-color: #0E0E0E;
}

.canvas-container {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    max-height: 100%;
}

.canvas {
    max-width: 100%;
    max-height: 100%;
}
</style>