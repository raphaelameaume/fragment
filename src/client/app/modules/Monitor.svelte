<script context="module">
let instances = 0;
let ID = 0;

</script>

<script>
import { clamp } from "lemonade-math";
import { onMount, beforeUpdate, afterUpdate, onDestroy, getContext } from "svelte";
import { derived } from "svelte/store";
import Module from "../ui/Module.svelte";
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentLayout } from "../stores/layout.js";
import ModuleHeaderSelect from "../ui/ModuleHeaderSelect.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

import { current as currentSketches } from "../stores/sketches.js";

export let name = "monitor";

let container, canvas;
let id = ID++;
let pristine = false;

instances++;

let index = instances - 1;

let options = [
    ...Object.keys($currentSketches).map((key) => ({
        value: key,
        label: $currentSketches[key].name ? $currentSketches[key].name : key,
    })),
    { value: "output", label: "output" },
];

let currentModule = getContext("currentModule");
let selected = options.map((option) => option.value).includes($currentModule.params.selected) ? $currentModule.params.selected : null;

let current;
onMount(() => {
    name = `${name} ${index}`;

    if (!selected) {
        selected = options[Math.min(index, options.length - 1)].value;
    }
});

onDestroy(() => {
    instances--;
});

$: {
    if (container) {
        if (index === instances - 1) {
            canvas = $currentRendering.canvas;
        } else if (!canvas) {
            canvas = document.createElement("canvas");
        }

        if (canvas !== $currentRendering.canvas) {
            canvas.width = $currentRendering.width;
            canvas.height = $currentRendering.height;
        }

        canvas.style.cssText = `
            max-width: 100%;
            max-height: 100%;

            background-color: red;
        `;

        if (!canvas.parentNode) {
            container.appendChild(canvas);
        }
    }
}

function handleChangeSelect(event) {
    $currentModule.params.selected = event.currentTarget.value;
    selected = $currentModule.params.selected;
    pristine = true;
};

</script>

<Module name={`${name}`}>
    <div slot="header-right">
        <ModuleHeaderAction border label="Pause">pause</ModuleHeaderAction>
        <ModuleHeaderAction border label="Open in another window">open</ModuleHeaderAction>
        <ModuleHeaderAction
            value={selected}
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
}
</style>
