<script>
import { getContext, onDestroy, onMount } from "svelte";
import { derived } from "svelte/store";
import { all as allSketches } from "../stores/sketches.js";
import { current as currentRendering, SIZES, canvases, sync } from "../stores/rendering.js";
import { current as currentTime } from "../stores/time.js";
import { exports, props } from "../stores/index.js";
import { checkForTriggersDown, checkForTriggersMove, checkForTriggersUp, checkForTriggersClick } from "../triggers/Mouse.js";

import { client } from "../client";
import { recordCanvas, screenshotCanvas } from "../utils/canvas.utils.js";
import { findRenderer } from "../stores/renderers";
import { removeHotListeners } from "../triggers/index.js";
import { recording } from "../stores/exports.js";
import KeyBinding from "../components/KeyBinding.svelte";

export let key;
export let id = 0;
export let paused = false;
export let visible = true;

let node, container;
let framerate = 60;
let elapsed = 0;
let elapsedRenderingTime = 0;
let canvas;
let _raf;
let _key = key;
let monitorID = getContext('monitorID');

let sketch;
let _created = false, _errored = false;
let renderer;
let noop = () => {};
let _renderSketch = noop;

function checkForResize() {
    if (!node) return;

    let needsUpdate = $currentRendering.resizing === SIZES.WINDOW || $currentRendering.resizing === SIZES.ASPECT_RATIO;

    let newWidth, newHeight;

    if ($currentRendering.resizing === SIZES.WINDOW) {
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

let sketchProps = derived(props, () => {
    return $props[key];
});

let needsRender = false;

sketchProps.subscribe(() => {
    if (framerate === 0) {
        // ensure we don't double render from createSketch
        requestAnimationFrame(() => {
            needsRender = true;
        })
    }
});

function createCanvas(canvas = document.createElement('canvas')) {
    canvas.width = $currentRendering.width * $currentRendering.pixelRatio;
    canvas.height = $currentRendering.height * $currentRendering.pixelRatio;

    canvas.onmousedown = (event) => checkForTriggersDown(event, key);
    canvas.onmousemove = (event) => checkForTriggersMove(event, key);
    canvas.onmouseup = (event) => checkForTriggersUp(event, key);
    canvas.onclick = (event) => checkForTriggersClick(event, key);

    container.appendChild(canvas);

    $canvases = [...$canvases, canvas];

    return canvas;
}

function destroyCanvas(canvas) {
    let canvasIndex = $canvases.findIndex(c => c === canvas);
    let copy = [...$canvases];
    copy.splice(canvasIndex, 1);
    $canvases = copy;

    canvas.onmousedown = null;
    canvas.onmousemove = null;
    canvas.onmouseup = null;
    canvas.onclick = null;
    
    if (canvas.parentNode === container) {
        canvas.parentNode.removeChild(canvas);
    }

    canvas = null;
}

async function createSketch(key) {
    sketch = $allSketches[key];

    if (!key || !sketch) return;

    if (__PRODUCTION__) {
        const { buildConfig = {} } = sketch;

        const resizing = sketch.buildConfig.canvasSize || SIZES.WINDOW;
        const overrides = {
            resizing,
        };

        if (buildConfig.dimensions && buildConfig.dimensions.length === 2) {
            const { dimensions } = buildConfig;
            overrides.width = dimensions[0];
            overrides.height = dimensions[1];
        }

        if (buildConfig.pixelRatio) {
            const { pixelRatio } = buildConfig;
            overrides.pixelRatio = typeof pixelRatio === "function" ? pixelRatio() : pixelRatio;
        }

        currentRendering.update((curr) => ({...curr, ...overrides}));
    }

    if (canvas) {
        if (renderer && typeof renderer.onDestroyPreview === "function") {
            renderer.onDestroyPreview({ id, canvas });
        }

        destroyCanvas(canvas);
    }

    renderer = await findRenderer(sketch.rendering);

    if (!container) return;

    canvas = createCanvas();
    removeHotListeners(key);

    let mountParams = {};

    if (typeof renderer.onMountPreview === "function") {
        mountParams = renderer.onMountPreview({
            id,
            canvas,
            width: $currentRendering.width,
            height: $currentRendering.height,
            pixelRatio: $currentRendering.pixelRatio,
        });
    }

    if (mountParams.canvas && mountParams.canvas !== canvas) {
        destroyCanvas(canvas);
        canvas = createCanvas(mountParams.canvas);
    }

    params = {
        ...mountParams,
        canvas,
    };

    framerate = isFinite(sketch.fps) ? sketch.fps : 60;

    const init = sketch.setup || sketch.init || noop;
    const resize = sketch.resize || noop;
    const { width, height, pixelRatio } = $currentRendering;

    try {
        _created = false;
        elapsedRenderingTime = 0;

        if (sketch.load) {
            await sketch.load();
        }

        init({
            width,
            height,
            pixelRatio,
            props,
            ...params,
        });

        resize({
            canvas,
            width,
            height,
            pixelRatio,
            props,
            ...params,
        });

        _created = true;
        _errored = false;

        _renderSketch = createRenderLoop();

        requestAnimationFrame(() => {
            needsRender = true;

            if (!_raf) {
                render();
            }
        });

        
    } catch(error) {
        onError(error);
    }
}

function onError(error) {
    _errored = true;
    console.error(error);

    cancelAnimationFrame(_raf);
    _raf = null;
}

let record = $recording;

$: {
    if ($recording && !record) {
        let recordOptions = {
            onTick: _renderSketch,
            framerate: $exports.framerate,
            filename: key,
            pattern: sketch?.filenamePattern,
            format: $exports.videoFormat,
            imageEncoding: $exports.imageEncoding,
            quality: $exports.videoQuality,
            params: {
                props: sketch.props,
            },
            onStart: () => {
                elapsedRenderingTime = 0;
            },
            onComplete: () => {
                $recording = false;
                record = null;
            }
        };

        if ($exports.useDuration) {
            recordOptions.duration = sketch.duration * $exports.loopCount;
        }

        record = recordCanvas(canvas, recordOptions);
    }

    if (record && !$recording) {
        record.stop();
        record = false;
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

    let frameLength = 1000 / framerate;
    let frameCount = framerate * duration;
    let interval = 1 / frameCount;

    let then = $currentTime.time;

    return ({ time = $currentTime.time, deltaTime = time - then } = {}) => {
        needsRender = false;
        then = time;

        try {
            onBeforeUpdatePreview({ id, canvas }); 

            let t = !$sync ? time : Math.floor(time / frameLength) * frameLength;

            if (hasDuration && framerate > 0) {
                playhead = (t / 1000) / duration;
                playhead %= 1;
                playhead = Math.floor(playhead / interval) * interval;
                playcount = Math.floor(((((elapsedRenderingTime) / 1000)) / duration));
            }

            draw({
                ...renderer,
                ...params,
                props: sketch.props,
                playhead,
                playcount,
                width: width * pixelRatio,
                height: height * pixelRatio,
                pixelRatio,
                time: t,
                deltaTime,
            });
            onAfterUpdatePreview({ id, canvas });
        } catch(error) {
            onError(error);
        }
    };
}

let then = performance.now();

function render() {
    _raf = requestAnimationFrame(render);

    if (!paused) {
        let now = performance.now();
        let deltaTime = now - then;
        then = now;

        elapsed += deltaTime;

        if (!$sync) {
            if ((elapsed) >= ((1 / framerate) * 1000)) {
                elapsed = 0;
                _renderSketch();
            }
        } else {
            _renderSketch();
        }

        elapsedRenderingTime += deltaTime;
    }

    if (needsRender) {
        _renderSketch();
    }
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
        if (current.resizing === SIZES.SCALE) {
            canvas.style.transform = `scale(${current.scale})`;
        } else {
            canvas.style.transform = null;
        }

        const { width, height, pixelRatio } = current;
        const resize = sketch.resize || noop;
        
        resize({
            canvas,
            width,
            height,
            pixelRatio,
            ...params,
        });

        _renderSketch = createRenderLoop();
        needsRender = true;
    }
});

async function save() {
    paused = true;

    await screenshotCanvas(canvas, {
        filename: key,
        pattern: sketch?.filenamePattern,
        params: {
            props: sketch.props,
        }
    });
    paused = false;
}

allSketches.subscribe(() => {
    if (_created || _errored) {
        createSketch(key);
    }
});

sync.subscribe(() => {
    if (_created) {
        _renderSketch = createRenderLoop();
    }
});

onMount(() => {
    createSketch(key);

    client.on('shader-update', () => {
        if (framerate === 0) {
            needsRender = true;
        }
    });

    resizeObserver.observe(node);
})

function checkForPause(event) {
    const keyboardEvent = event.detail;

    if (!keyboardEvent.metaKey || !keyboardEvent.ctrlKey) {
        keyboardEvent.preventDefault();
        paused = !paused;
        then = Date.now();
    }
}

function checkForSave(event) {
    const keyboardEvent = event.detail;

    if (keyboardEvent.metaKey || keyboardEvent.ctrlKey) {
        keyboardEvent.preventDefault();
        save();
    }
}

function checkForRefresh(event) {
    const keyboardEvent = event.detail;
    if (!keyboardEvent.metaKey && !keyboardEvent.ctrlKey) {
        keyboardEvent.preventDefault();
        createSketch(key);
    }
}

onDestroy(() => {
    resizeObserver.unobserve(node);
    cancelAnimationFrame(_raf);

    if (renderer && typeof renderer.onDestroyPreview === "function") {
        renderer.onDestroyPreview({ id, canvas });
    }

    renderer = null;

    if (canvas) {
        destroyCanvas(canvas);
    }

    _created = false;
});

$: {
    checkForResize();

    if (renderer && typeof renderer.onResizePreview === "function") {
        renderer.onResizePreview({
            id,
            width: $currentRendering.width,
            height: $currentRendering.height,
            pixelRatio: $currentRendering.pixelRatio,
        });
    }

    if (canvas) {
        const pixelRatio = $currentRendering.pixelRatio;

        canvas.width = $currentRendering.width * pixelRatio;
        canvas.height = $currentRendering.height * pixelRatio;
    }
}

</script>

<div
    bind:this={node}
    class="sketch-renderer"
    class:visible={visible}
    class:recording={$recording}
    style={`--background-color: ${sketch && sketch.backgroundColor ? sketch.backgroundColor : "inherit"}`}
>
    <div
        class="canvas-container"
        style="max-width: {$currentRendering.width}px; max-height: {$currentRendering.height}px;"
        bind:this={container}>
    </div>
    {#if $recording}
        <span class="record">REC</span>
    {/if}
</div>
<KeyBinding type="down" key=" " on:trigger={checkForPause} />
<KeyBinding type="down" key="r" on:trigger={checkForRefresh} />
<KeyBinding type="down" key="s" on:trigger={checkForSave} />

<style>
.sketch-renderer {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;

    background-color: var(--background-color, var(--color-lightblack));
}

.sketch-renderer:not(.visible) {
    display: none;
}

.canvas-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    max-height: 100%;
}

.sketch-renderer.recording .canvas-container {
    opacity: 0.5;
}

.record {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 2;

    display: flex;
    place-items: center;

    height: 16px;
    padding: 0 2px;

    color: var(--color-red);
    font-size: 10px;

    border: 1px solid var(--color-red);
    border-radius: 2px;
}

.record:before {
    --size: 6px;
    content: '';

    width: var(--size);
    height: var(--size);
    margin: 0 3px 0 1px;

    background-color: var(--color-red);
    border-radius: 50%;

    animation: fade 1s ease-in-out infinite;
}

@keyframes fade {
    0% {
        opacity: 0;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

:global(.canvas-container canvas){
    max-width: 100%;
    max-height: 100%;

    flex: none;

    width: auto !important;
    height: auto !important;

    background-color: var(--background-color, #000000);
}
</style>
