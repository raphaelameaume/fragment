<script context="module">
let instances = 0;

</script>

<script>
import { onMount, onDestroy } from "svelte";
import { writable } from "svelte/store";
import { screenshotCanvas } from "../utils/canvas.utils.js";
import { current as currentRendering, threshold } from "../stores/rendering.js";
import Module from "../ui/Module.svelte";
import SketchRenderer from "../ui/SketchRenderer.svelte";
import OutputRenderer from "../ui/OutputRenderer.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";
import ModuleHeaderSelectSketch from "../ui/ModuleHeaderSelectSketch.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import Field from "../ui/Field.svelte";

export let name = "monitor";

let canvas;
let index = instances;

instances++;

let paused = false;
// let pristine = false;
let recording = writable(false);
$currentRendering.monitors = instances;

let selected;

onMount(() => {
    name = `${name} ${index}`;
});

onDestroy(() => {
    instances--;
});


async function screenshot() {
    paused = true;

    await screenshotCanvas($currentRendering.canvas, selected);

    paused = false;
}

function record() {
    $recording = !$recording;
    paused = $recording;
    
    // if (recording) {
    //     paused = true;

    //     const { createFFmpeg, fetchFile } = FFmpeg;
    //     const ffmpeg = createFFmpeg({ log: true });
    //     ffmpeg.setProgress(({ ratio }) => {
    //         if (ratio === 1) {
    //             console.log(ratio);
    //             // encodingProgress.setAttribute("width", "180");
    //         }
    //     });
    //     ffmpeg.setLogger(({ type, message }) => {
    //         if (type === 'fferr' && /^frame=\s*\d+/.test(message)) {
    //             const frame = parseInt(message.match(/^frame=\s*(\d+)/)[1]);
    //         }
    //     });

    //     let deltaTime = 0;
    //     let time = 0;
    //     let frameCount = 0;
    //     let duration = 5;

    //     function tick() {
    //         _draw({ time, deltaTime });

    //         deltaTime = (1000 / framerate);
    //         time += deltaTime;

    //         canvas.toBlob(async function(blob) {
    //             const fn = `frame_${frameCount.toString().padStart(4, '0')}.png`;
    //             ffmpeg.FS('writeFile', fn, new Uint8Array(await blob.arrayBuffer()));
    //             frameCount++;

    //             console.log(`ffmpeg write frame`);

    //             if (frameCount < framerate * duration) {
    //                 requestAnimationFrame(tick);
    //             } else {
    //                 console.log("Done");
    //                 console.log("running ffmpeg");
    //                 await ffmpeg.run(...('-r 60 -i frame_%04d.png -vcodec libx264 -crf 15 -pix_fmt yuv420p output.mp4'.split(' ')));
    //                 const data = ffmpeg.FS('readFile', 'output.mp4');
    //                 const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));	
    //                 const a = document.createElement('a');
    //                 a.href = url;
    //                 a.download = document.title + '.mp4'
    //                 a.click();
    //                 paused = false;
    //             }
    //         });
    //     }

    //     ffmpeg.load().then(tick);
    // }
}

function handleSketchChange(event) {
    selected = event.detail;
}

</script>

<Module name={`${name}`}>
    <svelte:fragment slot="header-left">
        <ModuleHeaderAction border label="Record" on:click={record}>{$recording ? 'stop' : 'record'}</ModuleHeaderAction>
        <ModuleHeaderAction border label="Pause" on:click={() => paused = !paused}>{paused ? 'play' : 'pause'}</ModuleHeaderAction>
        <ModuleHeaderAction border label="Save" on:click={() => screenshot(canvas)}>save</ModuleHeaderAction>
    </svelte:fragment>
    <svelte:fragment slot="header-right">
        <ModuleHeaderSelectSketch
            {index}
            on:change={handleSketchChange}
        />
    </svelte:fragment>
    {#if selected && selected !== "output"}
        <SketchRenderer key={selected} {index} {paused} {recording}/>
    {:else if selected }
        <OutputRenderer {paused} />
    {/if}
    <!-- <FieldGroup name="recording">
        <Field key="duration" value={10} params={{suffix: 's'}} />
        <Field key="extension" params={{options: [".mp4", ".gif"]}} />
        <Field key="usePlayhead" value={false} />
    </FieldGroup>
    <FieldGroup name="screenshot">
        <Field key="extension" params={{options: [".jpg", ".png", ".webp"]}} />
    </FieldGroup> -->
</Module>
