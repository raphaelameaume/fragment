<script context="module">
let instances = 0;
</script>

<script>
import { onMount, onDestroy, getContext } from "svelte";
import { writable } from "svelte/store";
import { monitors } from "../stores/rendering.js";
import Module from "../ui/Module.svelte";
import SketchRenderer from "../ui/SketchRenderer.svelte";
import OutputRenderer from "../ui/OutputRenderer.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";
import ModuleHeaderSelectSketch from "../ui/ModuleHeaderSelectSketch.svelte";
import { map } from "lemonade-math";

export let name = "monitor";

let index = instances;
instances++;

let paused = false;
let recording = writable(false);

let selected;

onMount(() => {
    name = `${name} ${index}`;

    monitors.update((v) => {
        return [
            ...v,
            {
                isSketch: true,
                index,
                selected,
            }
        ]
    })
});

onDestroy(() => {
    instances--;

    monitors.update((value) => {
        return value.filter(m => m.index !== index);
    });
});

$: {
    monitors.update((ms) => {
        return ms.map((m, i) => {
            if (index !== m.index) return m;

            return {
                index,
                isSketch: true,
                selected
            }
        });
    })
}

async function screenshot() {
    paused = true;
    paused = false;
}

function record() {
    $recording = !$recording;
    paused = $recording;
}

function handleSketchChange(event) {
    selected = event.detail;
}

</script>

<Module name={`${name}`}>
    <svelte:fragment slot="header-left">
        <ModuleHeaderAction border label="Record" on:click={record}>{$recording ? 'stop' : 'record'}</ModuleHeaderAction>
        <ModuleHeaderAction border label="Pause" on:click={() => paused = !paused}>{paused ? 'play' : 'pause'}</ModuleHeaderAction>
        <ModuleHeaderAction border label="Refresh" on:click={() => {}}>save</ModuleHeaderAction>
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
</Module>
