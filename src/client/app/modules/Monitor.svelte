<script context="module">
let instances = 0;
let ID = 0;

</script>

<script>
import { clamp } from "lemonade-math";
import { onMount, beforeUpdate, afterUpdate, onDestroy } from "svelte";
import Module from "../ui/Module.svelte";
import { current as currentRendering } from "../stores/rendering.js";
import ModuleHeaderSelect from "../ui/ModuleHeaderSelect.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

import { current as currentSketches } from "../stores/sketches.js";

export let name = "monitor";
export let rowIndex;
export let colIndex;
export let grow;

let container, canvas;
let index;
let id = ID++;
let pristine = false;

let options = [
    ...Object.keys($currentSketches).map((key) => ({
        value: key,
        label: $currentSketches[key].name ? $currentSketches[key].name : key,
    })),
    { value: "output", label: "output" },
];

let current;
onMount(() => {
    index = $currentRendering.monitors.length;
    name = `${name} ${index}`;

    current.value = options[Math.min(index, options.length - 1)].value;

    $currentRendering.monitors = [
        ...$currentRendering.monitors,
        current,
    ];
});

onDestroy(() => {
    $currentRendering.monitors = $currentRendering.monitors.filter((monitor, i) => monitor.id !== id);
});

$: {
    const monitor = $currentRendering.monitors.find((monitor) => monitor.id === id);

    if (!monitor) {
        current = { id };
    }

    if (!pristine) {
        const count = $currentRendering.monitors.length;

        if ((index === 0 && count === 1) || (index === 1 && count === 2)) {
            current.value = options[options.length - 1].value;
        }
    }

    if (container) {
        if (index === instances - 1) {
            canvas = $currentRendering.canvas;
        } else if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = $currentRendering.width;
            canvas.height = $currentRendering.height;
        }

        canvas.style.cssText = `
            max-width: 100%;
            max-height: 100%;
        `;

        container.appendChild(canvas);
    }
}

function handleChangeSelect(event) {
    currentRendering.update((rendering) => ({
        ...rendering,
        monitors: rendering.monitors.map((monitor) => {
            return monitor.id !== id ? monitor : 
                {
                    ...monitor,
                    value: event.currentTarget.value
                }
        })
    }));

    pristine = true;
};

</script>

<Module name={`${name}`} grow={grow} {rowIndex} {colIndex}>
    <div slot="header-right">
        <ModuleHeaderAction border label="Pause">pause</ModuleHeaderAction>
        <ModuleHeaderAction border label="Open in another window">open</ModuleHeaderAction>
        <ModuleHeaderAction
            value={current.value}
            permanent
            border
            on:change={handleChangeSelect}
            options={options}
        />
    </div>
    <div class="canvas__container" bind:this={container}>
        <!-- {canvas} -->
        <!-- <canvas class="canvas" width="500" height="1500"></canvas> -->
    </div>
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
    /* background-color: red; */
}

.canvas {
    max-width: 100%;
    max-height: 100%;

    background-color: red;
}
</style>
