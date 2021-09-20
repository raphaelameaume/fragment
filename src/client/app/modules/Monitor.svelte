<script context="module">
let instances = 0;
let ID = 0;

</script>

<script>
import { onMount, beforeUpdate, afterUpdate, onDestroy, getContext } from "svelte";
import { derived } from "svelte/store";
import { clamp } from "lemonade-math";
import { current as currentSketches, renderable as renderableSketches } from "../stores/sketches.js";
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentLayout } from "../stores/layout.js";
import Module from "../ui/Module.svelte";
import ModuleHeaderSelect from "../ui/ModuleHeaderSelect.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

export let name = "monitor";

let container, canvas, context;
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
let needsUpdate = true;
let selected = options.map((option) => option.value).includes($currentModule.params.selected) ? $currentModule.params.selected : null;

let current;
onMount(() => {
    name = `${name} ${index}`;

    if (!selected) {
        selected = options[Math.min(index, options.length - 1)].value;
        $currentModule.params.selected = selected;
    }
});

onDestroy(() => {
    instances--;
});

$: {
    if (index === instances - 1) {
        canvas = $currentRendering.canvas;
    } else if (!canvas || canvas === $currentRendering.canvas) {
        canvas = document.createElement("canvas");
    }

    if (canvas !== $currentRendering.canvas) {
        canvas.width = $currentRendering.width;
        canvas.height = $currentRendering.height;

        context = canvas.getContext("2d");
    }

    canvas.style.cssText = `
        max-width: 100%;
        max-height: 100%;

        // background-color: red;
    `;

    if (container && !canvas.parentNode) {
        container.appendChild(canvas);
    }

    // if (needsUpdate) {
        const sketch = $currentSketches[selected];

        if (sketch) {
            const init = sketch.setup || sketch.init;

            console.log(`Monitor ${index} :: render to`, context);

            if (typeof init === "function") {
                init({});
            }

            const draw = sketch.draw || sketch.update || sketch.render;

            if (typeof draw === "function") {
                const renderer = {
                    ...$currentRendering.renderer,
                    context: canvas === $currentRendering.canvas ? $currentRendering.renderer.context : context,
                };

                draw({
                    renderer,
                    context: renderer.context,
                    width: $currentRendering.width,
                    height: $currentRendering.height,
                });
            }
        }
// 
        needsUpdate = false;
    // }
}

function handleChangeSelect(event) {
    selected = event.currentTarget.value;
    $currentModule.params.selected = selected;

    needsUpdate = selected !== $currentModule.params.selected;
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
