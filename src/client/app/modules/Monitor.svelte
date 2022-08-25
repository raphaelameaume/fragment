<script context="module">
let ID = 0;
</script>

<script>
import { onMount, onDestroy } from "svelte";
import Module from "../ui/Module.svelte";
import SketchRenderer from "../ui/SketchRenderer.svelte";
import OutputRenderer from "../ui/OutputRenderer.svelte";
import SketchSelect from "../ui/SketchSelect.svelte";
import { current as currentSketches } from "../stores/sketches.js";
import { monitors } from "../stores/rendering";

export let mID;
export let hasHeader = true;

let id = ID++;
let name = "monitor";
let selected = $currentSketches[Math.min(id, $currentSketches.length - 1)];

onMount(() => {
    $monitors = [
        ...$monitors,
        {
            id,
            selected,
        }
    ];
});

monitors.subscribe((all) => {
    const current = all.find((monitor) => monitor.id === id);

    if (current && current.selected !== selected) {
        selected = current.selected;
    }
})

onDestroy(() => {
    $monitors = $monitors.filter((m) => m.id !== id);
});

$: index = $monitors.findIndex(monitor => monitor.id === id);
$: moduleName = `${name} ${$monitors.length > 1 ? (index + 1) : ""}`;
</script>

<Module {mID} slug="monitor" name={moduleName} {hasHeader} scrollable={false}>
    <svelte:fragment slot="header-right">
        <SketchSelect
            monitorID={id}
            {selected}
        />
    </svelte:fragment>
    {#if selected && selected !== "output"}
        <SketchRenderer key={selected} {id} />
    {:else if selected }
        <OutputRenderer />
    {/if}
</Module>
