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
let _renderSketch = () => {};

let sketch, props;

function createSketch(key) {
    if (!key) return;

    sketch = $currentSketches[key];
    
    if (!sketch) return;

    props = proxyProps(sketch.props);
    framerate = sketch.fps ? sketch.fps : 60;

    const init = sketch.setup || sketch.init;
    const { width, height } = $currentRendering;

    init({
        width,
        height,
        props,
    });

    _renderSketch = createRenderLoop();
}

function createRenderLoop() {
    const { width, height, pixelRatio, renderer } = $currentRendering;
    const draw = sketch.draw || sketch.update;
    const context = canvas.getContext("2d");

    console.log("renderloop", { width, height });

    let elapsed = 0;

    return ({ time = $currentTime.time, deltaTime = $currentTime.deltaTime } = {}) => {
        elapsed += deltaTime;

        if (elapsed >= ((1 / framerate) * 1000)) {
            draw({
                renderer,
                props,
                context,
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
    if (canvas) {
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

        _renderSketch = createRenderLoop();
    }
});


onMount(() => {
    emit(PREVIEW_MOUNT, { index, canvas });

    createSketch(key);

    render();
})

onDestroy(() => {
    cancelAnimationFrame(_raf);
})

</script>

<div class="sketch-renderer">
    <canvas
        width={$currentRendering.width * $currentRendering.pixelRatio}
        height={$currentRendering.height * $currentRendering.pixelRatio}
        bind:this={canvas}
        style="max-width: 100%; max-height: 100%; background: red;"
        on:mousedown={(event) => checkForTriggersDown(event, key) }
        on:click={(event) => checkForTriggersClick(event, key) }
        on:mouseup={(event) => checkForTriggersUp(event, key) }
        on:mousemove={(event) => checkForTriggersMove(event, key) }
    ></canvas>
</div>

<style>
.sketch-renderer {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;

    background-color: #0E0E0E;
}
</style>
