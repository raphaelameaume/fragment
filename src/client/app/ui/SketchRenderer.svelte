<script>
import { onDestroy, onMount } from "svelte";
import { writable } from "svelte/store";
import { current as currentSketches } from "../stores/sketches.js";
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentTime } from "../stores/time.js";
import { store as currentProps } from "../stores/props";
import Prop from "../core/Prop";
import { checkForTriggersDown, checkForTriggersMove, checkForTriggersUp, checkForTriggersClick } from "../triggers/Mouse.js";
import { client } from "../client";
import { emit, TRANSITION_CHANGE } from "../events";
import { recordCanvas, screenshotCanvas } from "../utils/canvas.utils.js";
import { transitions } from "../transitions/index.js";
import { findRenderer } from "../stores/renderers";
import { onKeyDown } from "../triggers/Keyboard.js";

export let key;
export let index = 0;
export let paused = false;
export let recording = writable(false);

let node;
let framerate = 60;
let elapsedRenderingTime = 0;
let canvas;
let _raf;
let _key = key;

let sketch, props;
let renderer;
let noop = () => {};
let _renderSketch = noop;

let params = {};

function createProps(props = []) {
    let keys = Object.keys(props);
    let result = {};

    if (props) {
        keys.forEach((propKey) => {
            result[propKey] = new Prop(propKey, {...props[propKey] });
        });
    }

    return result;
}

async function createSketch(key) {
    if (!key) return;

    sketch = $currentSketches[key];

    if (!sketch) return;

    renderer = await findRenderer(sketch.rendering);

    let mountParams = renderer.onMountPreview({ index, canvas });

    params = {
        ...mountParams,
        canvas,
    };

    if (!$currentProps[key]) {
        $currentProps = {
            ...$currentProps,
            [`${key}`]: createProps(sketch.props)
        };
    }

    props = $currentProps[key];

    framerate = isFinite(sketch.fps) ? sketch.fps : 60;

    const init = sketch.setup || sketch.init;
    const resize = sketch.resize || (() => {});
    const { width, height, pixelRatio } = $currentRendering;

    try {
        init({
            width,
            height,
            props,
            ...params,
        });

        resize({ width, height, pixelRatio });

        _renderSketch = createRenderLoop();

        _renderSketch();
    } catch(error) {
        console.error(error);
    }
    
}

let record = $recording;

$: {
    if ($recording && !record) {
        let recordOptions = {
            name: key,
            onTick: _renderSketch,
            framerate: 30,
            onStart: () => {
                elapsedRenderingTime = 0;
            },
            onComplete: () => {
                $recording = false;
                record = null;
            }
        };

        if (sketch && sketch.duration) {
            recordOptions.duration = sketch.duration * 4;
        }

        record = recordCanvas(canvas, recordOptions);
    }

    if (record && !$recording) {
        record.stop();
        $recording = false;
        record = null;
    }
}

function createRenderLoop() {
    const { width, height, pixelRatio } = $currentRendering;
    const draw = sketch.draw || sketch.update;
    const { duration } = sketch;

    let playhead = 0;
    let playcount = 0;
    let hasDuration = isFinite(duration);

    let onBeforeUpdatePreview = renderer.onBeforeUpdatePreview || noop;
    let onAfterUpdatePreview = renderer.onAfterUpdatePreview || noop;

    return ({ time = $currentTime.time, deltaTime = $currentTime.deltaTime } = {}) => {
        onBeforeUpdatePreview({ index, canvas });

        elapsedRenderingTime += deltaTime * 60 / framerate;

        if (hasDuration) {
            playhead = (((elapsedRenderingTime / 1000)) / duration) % 1;
            playcount = Math.floor((((elapsedRenderingTime / 1000)) / duration));
        }

        draw({
            ...renderer,
            ...params,
            props,
            playhead,
            playcount,
            width: width * pixelRatio,
            height: height * pixelRatio,
            time,
            deltaTime,
        });
        onAfterUpdatePreview({ index, canvas });
    };
}

let elapsed = $currentTime.time;

function render() {
    if (!paused) {
        if ((elapsed) >= ((1 / framerate) * 1000)) {
            elapsed = 0;

            _renderSketch();
        }

        elapsed += $currentTime.deltaTime;
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

        _renderSketch();
    }
});

async function save() {
    paused = true;

    await screenshotCanvas(canvas, key);
    paused = false;
}

let offKeyboardShortcutSave, offKeyboardShortcutPause;

onMount(async () => {
    await createSketch(key);

    client.on('shader-update', () => {
        if (framerate === 0) {
            _renderSketch();
        }
    });

    if (!$currentRendering.transition) {
        let transitionOptions = Object.keys(transitions);
        $currentRendering.transition = transitionOptions[0];
    }
    
    emit(TRANSITION_CHANGE, transitions[$currentRendering.transition]);

    render();

    if (offKeyboardShortcutSave) {
        offKeyboardShortcutSave();
        offKeyboardShortcutSave = null;
    }

    offKeyboardShortcutSave = onKeyDown('s', (event) => {
        if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            save();
        }
    });

    offKeyboardShortcutPause = onKeyDown(' ', (event) => {
        if (!event.metaKey || !event.ctrlKey) {
            event.preventDefault();
            paused = !paused;
        }
    });
})

onDestroy(() => {
    cancelAnimationFrame(_raf);

    if (offKeyboardShortcutSave) {
        offKeyboardShortcutSave.destroy();
        offKeyboardShortcutSave = null;
    }

    if (offKeyboardShortcutPause) {
        offKeyboardShortcutPause.destroy();
        offKeyboardShortcutPause = null;
    }
})

$: canvasWidth = $currentRendering.width * $currentRendering.pixelRatio;
$: canvasHeight = $currentRendering.height * $currentRendering.pixelRatio;

</script>

<div class="sketch-renderer" bind:this={node}>
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

    background-color: var(--color-lightblack);
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
