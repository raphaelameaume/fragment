<script context="module">
let instances = 0;

</script>

<script>
import { onMount, beforeUpdate, afterUpdate, onDestroy, getContext } from "svelte";
import { derived } from "svelte/store";
import { clamp } from "lemonade-math";
import { current as currentSketches } from "../stores/sketches.js";
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentLayout } from "../stores/layout.js";
import Module from "../ui/Module.svelte";
import ModuleHeaderSelect from "../ui/ModuleHeaderSelect.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

export let name = "monitor";

let container, canvas, context;
let pristine = false;
let index = instances;
instances++;
$currentRendering.monitors = instances;

let options = [
    ...Object.keys($currentSketches).map((key) => ({
        value: key,
        label: $currentSketches[key].name ? $currentSketches[key].name : key,
    })),
    { value: "output", label: "output" },
];

let currentModule = getContext("currentModule");
let needsUpdate = false;
let selected = options.map((option) => option.value).includes($currentModule.params.selected) ? $currentModule.params.selected : null;

let current;
let _raf;
let _draw = () => {};

function render() {
    _draw();

    _raf = requestAnimationFrame(render);
}

onMount(() => {
    name = `${name} ${index}`;

    render();

    console.log("Monitor :: onMount");

    if (!selected && options.length) {
        selected = options[Math.min(index, options.length - 1)].value;
        $currentModule.params.selected = selected;
    }
});

onDestroy(() => {
    instances--;

    cancelAnimationFrame(_raf);
});

$: {
    if (needsUpdate && _raf) {
        cancelAnimationFrame(_raf);
        needsUpdate = false;
    }
}

function createSketch(sketch) {
    const init = sketch.setup || sketch.init;

    if (typeof init === "function") {
        init({});
    }

    const draw = sketch.draw || sketch.update || sketch.render;

    if (typeof draw === "function") {
        const renderer = {
            ...$currentRendering.renderer,
            context: canvas === $currentRendering.canvas ? $currentRendering.renderer.context : context,
        };

        _draw = () => {
            draw({
                renderer,
                props: sketch.props || {},
                context: renderer.context,
                width: $currentRendering.width,
                height: $currentRendering.height,
            });
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
        {#if index === ($currentRendering.monitors - 1)}
            <p></p>
        {:else}
            <canvas width={$currentRendering.width} height={$currentRendering.height} style="max-width: 100%; max-height: 100%; background: red;" bind:this={canvas}></canvas>
        {/if}
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
