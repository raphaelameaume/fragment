<script context="module">
let instances = 0;

</script>

<script>
import { onMount, onDestroy, getContext } from "svelte";
import { sketchesCount } from "@fragment/props";
import { exportCanvas, saveDataURL } from "../utils/canvas.utils.js";
import { current as currentSketches } from "../stores/sketches.js";
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentTime } from "../stores/time.js";
import { checkForTriggersDown, checkForTriggersMove, checkForTriggersUp, checkForTriggersClick, reset } from "../triggers/Mouse.js";
import Module from "../ui/Module.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import Field from "../ui/Field.svelte";

export let name = "monitor";

let container, canvas, context;
let pristine = false;
let index = instances;
let paused = false;
let recording = false;
instances++;
$currentRendering.monitors = instances;

let options = [
    ...Object.keys($currentSketches).map((key) => ({
        value: key,
        label: $currentSketches[key].name ? $currentSketches[key].name : key,
    })),
];

if (sketchesCount > 1) {
    options = [
        ...options,
        { value: "output", label: "output" },
    ];
}

let currentModule = getContext("currentModule");
let selected = options.map((option) => option.value).includes($currentModule.params.selected) ? $currentModule.params.selected : null;

let current;
let _raf;
let _draw = () => {};

function render() {
    if (!paused) {
        _draw();
    }

    _raf = requestAnimationFrame(render);
}

onMount(() => {
    name = `${name} ${index}`;

    render();

    if (!selected && options.length) {
        selected = options[Math.min(index, options.length - 1)].value;
        $currentModule.params.selected = selected;
    }
});

onDestroy(() => {
    instances--;

    cancelAnimationFrame(_raf);
});

function proxyProps(props = {}) {
    const proxy = new Proxy(props, {
        get: (obj, prop) => {
            return prop in obj ? obj[prop].value : undefined
        }
    });

    return proxy;
}


let framerate = 60;
function createSketch(sketch) {
    reset(selected);

    const init = sketch.setup || sketch.init;
    const proxiedProps = proxyProps(sketch.props);

    if (typeof init === "function") {
        init({
            width: $currentRendering.width,
            height: $currentRendering.height,
            props: proxiedProps,
        });
    }

    framerate = sketch.fps || 60;
    const draw = sketch.draw || sketch.update || sketch.render;

    if (typeof draw === "function") {
        const renderer = {
            ...$currentRendering.renderer,
            context: canvas === $currentRendering.canvas ? $currentRendering.renderer.context : context,
        };

        let elapsed = 0;

        _draw = ({ time = $currentTime.time, deltaTime = $currentTime.deltaTime } = {}) => {
            elapsed += deltaTime;

            if (elapsed >= ((1 / framerate) * 1000)) {
                elapsed = 0;

                const { width, height } = $currentRendering;

                draw({
                    renderer,
                    props: proxiedProps,
                    context: renderer.context,
                    width,
                    height,
                    time,
                    deltaTime,
                });
            }
        }
    }
}

$: {
    if (canvas) {
        const sketch = $currentSketches[selected];

        context = canvas.getContext("2d");

        if (sketch) {
            createSketch(sketch);
        }
    }
}

function handleChangeSelect(event) {
    // remove previous events registered
    reset(selected);

    selected = event.currentTarget.value;
    $currentModule.params.selected = selected;

    pristine = true;
};

async function screenshot() {
    paused = true;
    const { extension, type, dataURL } = exportCanvas(canvas);
    
    const now = new Date();

    const year = now.toLocaleString('default', { year: 'numeric' });
    const month = now.toLocaleString('default', { month: 'numeric' });
    const day = now.toLocaleString('default', { day: 'numeric' });
    const hours = now.toLocaleString('default', { hour: 'numeric' }).split(' ')[0];
    const minutes = now.toLocaleString('default', { minute: 'numeric' });
    const seconds = now.toLocaleString('default', { second: 'numeric' });

    const prefix = `${selected}.`;
    const date = `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;
    const filename = `${prefix}${date}${extension}`;

    await saveDataURL(dataURL, { filename });

    paused = false;
}

function record() {
    recording = !recording;
    
    if (recording) {
        paused = true;

        const { createFFmpeg, fetchFile } = FFmpeg;
        const ffmpeg = createFFmpeg({ log: true });
        ffmpeg.setProgress(({ ratio }) => {
            if (ratio === 1) {
                console.log(ratio);
                // encodingProgress.setAttribute("width", "180");
            }
        });
        ffmpeg.setLogger(({ type, message }) => {
            if (type === 'fferr' && /^frame=\s*\d+/.test(message)) {
                const frame = parseInt(message.match(/^frame=\s*(\d+)/)[1]);
            }
        });

        let deltaTime = 0;
        let time = 0;
        let frameCount = 0;
        let duration = 5;

        function tick() {
            _draw({ time, deltaTime });

            deltaTime = (1000 / framerate);
            time += deltaTime;

            canvas.toBlob(async function(blob) {
                const fn = `frame_${frameCount.toString().padStart(4, '0')}.png`;
                ffmpeg.FS('writeFile', fn, new Uint8Array(await blob.arrayBuffer()));
                frameCount++;

                console.log(`ffmpeg write frame`);

                if (frameCount < framerate * duration) {
                    requestAnimationFrame(tick);
                } else {
                    console.log("Done");
                    console.log("running ffmpeg");
                    await ffmpeg.run(...('-r 60 -i frame_%04d.png -vcodec libx264 -crf 15 -pix_fmt yuv420p output.mp4'.split(' ')));
                    const data = ffmpeg.FS('readFile', 'output.mp4');
                    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));	
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = document.title + '.mp4'
                    a.click();
                    paused = false;
                }
            });
        }

        ffmpeg.load().then(tick);
    }
}

$: {
    if (index === ($currentRendering.monitors - 1) && container) {
        $currentRendering.canvas.style.cssText= "max-width: 100%; max-height: 100%; background: red;";
        container.appendChild($currentRendering.canvas);

        canvas = $currentRendering.canvas;
    }
}

</script>

<Module name={`${name}`}>
    <div slot="header-left">
        <ModuleHeaderAction border label="Record" on:click={record}>record</ModuleHeaderAction>
        <ModuleHeaderAction border label="Pause" on:click={() => paused = !paused}>{paused ? 'play' : 'pause'}</ModuleHeaderAction>
        <ModuleHeaderAction border label="Save" on:click={() => screenshot(canvas)}>save</ModuleHeaderAction>
    </div>
    <div slot="header-right">
        <ModuleHeaderAction
            value={selected}
            permanent
            border
            on:change={handleChangeSelect}
            options={options}
        />
    </div>
    <div class="canvas__container" bind:this={container}>
        {#if index !== ($currentRendering.monitors - 1)}
            <canvas
                width={$currentRendering.width * $currentRendering.dpr}
                height={$currentRendering.height * $currentRendering.dpr}
                bind:this={canvas}
                style="max-width: 100%; max-height: 100%; background: red;"
                on:mousedown={(event) => checkForTriggersDown(event, selected) }
                on:click={(event) => checkForTriggersClick(event, selected) }
                on:mouseup={(event) => checkForTriggersUp(event, selected) }
                on:mousemove={(event) => checkForTriggersMove(event, selected) }
            ></canvas>
        {/if}
    </div>
    <!-- <FieldGroup name="recording">
        <Field key="duration" value={10} params={{suffix: 's'}} />
        <Field key="extension" params={{options: [".mp4", ".gif"]}} />
        <Field key="usePlayhead" value={false} />
    </FieldGroup>
    <FieldGroup name="screenshot">
        <Field key="extension" params={{options: [".jpg", ".png", ".webp"]}} />
    </FieldGroup> -->
</Module>

<style>
.canvas__container {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;

    background-color: #0E0E0E;
}
</style>
