<script context="module">
let instances = 0;

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
export let grow;

let container;
let canvas;

let offsetWidth, offsetHeight;

let options = [
    ...Object.keys($currentSketches).map((key) => ({
        value: key,
        label: $currentSketches[key].name ? $currentSketches[key].name : key,
    })),
    { value: "output", label: "output" },
];

let index;

$: currentSketch = options[0].value;

let pristine = false;

$: {
    if (!pristine) {
        const count = $currentRendering.monitors.length;

        if ((index === 0 && count === 1) || (index === 1 && count === 2)) {
            currentSketch = options[options.length - 1].value;
        }
    }
}

onMount(() => {
    index = $currentRendering.monitors.length;

    currentSketch = options[Math.min(index, options.length - 1)].value;

    $currentRendering.monitors = [
        ...$currentRendering.monitors,
        {},
    ];
});

onDestroy(() => {
    $currentRendering.monitors = $currentRendering.monitors.filter((monitor, i) => index !== i);
});

$: {
    if (container) {
        if (index === instances - 1) {
            canvas = $currentRendering.canvas;
        } else if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = offsetWidth;
            canvas.height = offsetWidth * $currentRendering.height / $currentRendering.width;

            // @TODO
            // create canvas
            // register canvas
        }

        canvas.style.cssText = `
            max-width: 100%;
            max-height: 100%;
        `;

        if (!canvas.parentNode) {
            container.appendChild(canvas);
        }
    }
}

const handleChangeSelect = (event) => {
    currentSketch = event.currentTarget.value;
    pristine = true;
};

</script>

<Module name={name} grow={grow}>
    <div slot="header-right">
        <ModuleHeaderAction border label="Pause">
            pause
            <!-- <svg fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 6.75V17.25"></path>
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.75 6.75V17.25"></path>
            </svg> -->
        </ModuleHeaderAction>
        <ModuleHeaderAction border label="Open in another window">
            open
            <!-- <svg fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.25 17.25H6.75C5.64543 17.25 4.75 16.3546 4.75 15.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V9.25"></path>
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.75 13.75C10.75 13.1977 11.1977 12.75 11.75 12.75H18.25C18.8023 12.75 19.25 13.1977 19.25 13.75V18.25C19.25 18.8023 18.8023 19.25 18.25 19.25H11.75C11.1977 19.25 10.75 18.8023 10.75 18.25V13.75Z"></path>
            </svg> -->
        </ModuleHeaderAction>
        <ModuleHeaderAction
            value={currentSketch}
            permanent
            border
            on:change={handleChangeSelect}
            options={options}
        />
    </div>
    <div class="canvas__container" bind:this={container} bind:offsetWidth={offsetWidth} bind:offsetHeight={offsetHeight}>
    </div>
</Module>

<style>
.canvas__container {
    position: relative;
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;

    background-color: #0E0E0E;
}
</style>
