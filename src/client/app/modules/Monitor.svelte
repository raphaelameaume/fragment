<script context="module">
import { writable } from "svelte/store";

export const monitors = writable([]);

monitors.subscribe((all) => {
    console.log(all);
})

let ID = 0;

</script>

<script>
import { onMount, onDestroy, setContext } from "svelte";
import Module from "../ui/Module.svelte";
import { current as currentSketches } from "../stores/sketches.js";
import SketchRenderer from "../ui/SketchRenderer.svelte";
import OutputRenderer from "../ui/OutputRenderer.svelte";
import ModuleHeaderSelectSketch from "../ui/ModuleHeaderSelectSketch.svelte";


let id = ID++;
let name = "monitor";
let selected = $currentSketches[Math.min(id, $currentSketches.length - 1)];

setContext('monitorID', id);

onMount(() => {
    monitors.update((all) => {
        return [
            ...all,
            {
                id,
                isSketch: true,
                selected,
            }
        ]
    })
});

monitors.subscribe((all) => {
    const current = all.find((monitor) => monitor.id === id);

    if (current && current.selected !== selected) {
        selected = current.selected;
    }
})

onDestroy(() => {
    monitors.update((all) => {
        return all.filter(m => m.id !== id);
    });
});

$: index = $monitors.findIndex(monitor => monitor.id === id);
$: moduleName = `${name} ${$monitors.length > 1 ? (index + 1) : ""}`;
$: hasHeader = !__PRODUCTION__;
</script>

<Module name={moduleName} {hasHeader} scrollable={false}>
    <svelte:fragment slot="header-right">
        <ModuleHeaderSelectSketch
            monitorID={id}
            monitorIndex={index}
        />
    </svelte:fragment>
    {#if selected && selected !== "output"}
        <SketchRenderer key={selected} {id} />
    {:else if selected }
        <OutputRenderer />
    {/if}
</Module>
