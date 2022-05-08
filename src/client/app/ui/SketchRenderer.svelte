<script>
import { onDestroy, onMount } from "svelte";
import { writable } from "svelte/store";
import { current as currentSketches } from "../stores/sketches.js";
import { current as currentRendering, SIZES } from "../stores/rendering.js";
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

let node, container;
let framerate = 60;
let elapsedRenderingTime = 0;
let canvas;
let _raf;
let _key = key;

let sketch, props;
let _created = false;
let renderer;
let noop = () => {};
let _renderSketch = noop;

function checkForResize() {
    if (!node) return;

    let needsUpdate = $currentRendering.resizing === SIZES.MONITOR || $currentRendering.resizing === SIZES.ASPECT_RATIO;

    let newWidth, newHeight;

    if ($currentRendering.resizing === SIZES.MONITOR) {
        newWidth = node.offsetWidth;
        newHeight = node.offsetHeight;
    } else if ($currentRendering.resizing === SIZES.ASPECT_RATIO) {
        const { offsetWidth, offsetHeight } = node;
        const aspectRatio = $currentRendering.aspectRatio;
        const monitorRatio = offsetWidth / offsetHeight;

        if (aspectRatio < monitorRatio) {
            newHeight = offsetHeight;
            newWidth = newHeight * aspectRatio;
        } else {
            newWidth = offsetWidth;
            newHeight = newWidth / aspectRatio;
        }
    }

    needsUpdate = needsUpdate && (newWidth !== $currentRendering.width || newHeight !== $currentRendering.height);

    if (needsUpdate) {
        currentRendering.update(curr => {
            return {
                ...curr,
                width: newWidth,
                height: newHeight,
            }
        });
    }
}

let resizeObserver = new ResizeObserver(() => {
    checkForResize();
});

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

    if (_created && canvas) {
        if (typeof renderer.onDestroyPreview === "function") {
            renderer.onDestroyPreview({ index, canvas });
        }
        
        canvas.parentNode.removeChild(canvas);
        canvas = null;
    }

    canvas = document.createElement('canvas');
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    canvas.width = $currentRendering.width * $currentRendering.pixelRatio;
    canvas.height = $currentRendering.height * $currentRendering.pixelRatio;

    container.appendChild(canvas);

    let mountParams = {};

    if (typeof renderer.onMountPreview === "function") {
        mountParams = renderer.onMountPreview({
            index,
            canvas,
            width: $currentRendering.width,
            height: $currentRendering.height,
            pixelRatio: $currentRendering.pixelRatio,
        });
    }

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
        _created = false;
        init({
            width,
            height,
            props,
            ...params,
        });

        resize({ width, height, pixelRatio });

        _renderSketch = createRenderLoop();

        _renderSketch();
        _created = true;
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
    if (canvas && _created) {
        const { width, height, pixelRatio } = current;
        sketch.resize({ 
            width,
            height,
            pixelRatio,
        });

        _renderSketch = createRenderLoop();
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

    currentSketches.subscribe(() => {
        createSketch(key);
    });

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

    resizeObserver.observe(node);
})

onDestroy(() => {
    resizeObserver.unobserve(node);
    cancelAnimationFrame(_raf);

    if (offKeyboardShortcutSave) {
        offKeyboardShortcutSave.destroy();
        offKeyboardShortcutSave = null;
    }

    if (offKeyboardShortcutPause) {
        offKeyboardShortcutPause.destroy();
        offKeyboardShortcutPause = null;
    }
});

$: {
    checkForResize();

    if (canvas) {
        const pixelRatio = $currentRendering.pixelRatio;

        canvas.width = $currentRendering.width * pixelRatio;
        canvas.height = $currentRendering.height * pixelRatio;
    }
}

</script>

<div class="sketch-renderer" bind:this={node}>
    <div class="canvas-container" style="max-width: {$currentRendering.width}px;" bind:this={container}>
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
    display: block;
    max-width: 100%;
    max-height: 100%;
}
</style>
