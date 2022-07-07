<script context="module">
let instances = 0;
</script>

<script>
import { onMount, onDestroy, getContext } from "svelte";
import { monitors } from "../stores/rendering.js";
import Module from "../ui/Module.svelte";
import { current as currentSketches } from "../stores/sketches.js";
import { current as currentLayout } from "../stores/layout.js";
import SketchRenderer from "../ui/SketchRenderer.svelte";
import OutputRenderer from "../ui/OutputRenderer.svelte";
import ModuleHeaderSelectSketch from "../ui/ModuleHeaderSelectSketch.svelte";

export let name = "monitor";

let currentModule = getContext('currentModule');

let index = isFinite($currentModule.params.index) ? $currentModule.params.index : instances;
instances++;

$currentModule.params.index = index;

let paused = false;

$: selected = $currentSketches[Math.min(index, $currentSketches.length - 1)];

onMount(() => {
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

$: moduleName = `${name} ${instances > 1 ? index : ""}`; 

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

$: hasHeader = $currentLayout.name !== "Single" && !__PRODUCTION__;

</script>

<Module name={moduleName} {hasHeader}>
    <svelte:fragment slot="header-right">
        <ModuleHeaderSelectSketch {index} />
    </svelte:fragment>
    {#if selected && selected !== "output"}
        <SketchRenderer key={selected} {index} {paused} />
    {:else if selected }
        <OutputRenderer {paused} />
    {/if}
</Module>
