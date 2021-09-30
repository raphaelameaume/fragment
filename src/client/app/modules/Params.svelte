<script context="module">
let instances = 0;
</script>

<script>
import { getContext, onMount, setContext } from "svelte";
import { sketchesCount } from "@fragment/props";
import { current as currentLayout } from "../stores/layout.js";
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentSketches } from "../stores/sketches.js";

import Module from "../ui/Module.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import FieldSpace from "../ui/FieldSpace.svelte";
import Field from "../ui/Field.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

let pristine = false;
let sketch;

let index = instances;
instances++;

let options = [];

let currentModule = getContext("currentModule");
let selected;
let selectedSketch;

let monitors;

$: {
    monitors = [];
    $currentLayout.rows.forEach(row => {
        const { cols = [] } = row;
        
        cols.forEach(col => {
            const { modules = [] } = col;

            modules.forEach((m) => {
                if (m.name === "monitor") {
                    monitors.push(m);
                }
            })
        });
    });

    options = [
        ...monitors.map((monitor, index) => {
            return { value: `${index}`, label: `monitor ${index}`}
        }),
    ];

    selected = options.map((option) => option.value).includes($currentModule.params.selected) ? $currentModule.params.selected : null;

    const monitor = monitors[Number(selected)];

    if (monitor && monitor.params) {
        selectedSketch = monitor.params.selected;
        sketch = $currentSketches[selectedSketch];
    }
}

onMount(() => {
    if (!selected) {
        selected = options[Math.min(index, options.length - 1)].value;
        $currentModule.params.selected = selected;
    }
});

function handleChangeSelect(event) {
    selected = event.currentTarget.value;
    $currentModule.params.selected = selected;

    pristine = true;
}

function handleChangeDimensions(event) {
    const [width, height] = event.detail;

    currentRendering.update((curr) => {
        return {
            ...curr,
            width,
            height
        }
    });
}

</script>

<Module name="Parameters">
    <div slot="header-right">
        {#if monitors.length > 1 }
        <ModuleHeaderAction
            value={$currentModule.params.selected}
            permanent
            border
            on:change={handleChangeSelect}
            options={options}
        />
        {/if }
    </div>
    {#if Number(selected) === monitors.length - 1 && sketchesCount === 1}
        <Field
            key="dimensions"
            value={[
                $currentRendering.width,
                $currentRendering.height,
            ]}
            on:change={handleChangeDimensions}
            params={{
                step: 1,
                suffix: "px",
                locked: false
            }}
        />
        <Field
            key="pixelRatio"
            value={$currentRendering.dpr}
            on:change={(event) => $currentRendering.dpr = event.detail }
            params={{
                step: 0.1,
            }}
        />
    {/if}

    {#if sketch }
        {#if typeof sketch.props === "object"}
            <Field key="framerate" value={sketch.fps ? sketch.fps : 60} params={{disabled: true}}/>
            {#each Object.keys(sketch.props) as key, i}
                <Field
                    sketch={sketch}
                    context={selectedSketch}
                    key={key}
                    type={sketch.props[key].type}
                    params={(() => {
                        const { value, ...params } = sketch.props[key];

                        return params;
                    })()}
                />
            {/each}
        {/if}
    {/if}
    {#if Number(selected) === monitors.length - 1 && sketchesCount > 1}
        <Field
            key="dimensions"
            value={[
                $currentRendering.width,
                $currentRendering.height,
            ]}
            on:change={handleChangeDimensions}
            params={{
                step: 1,
                suffix: "px",
                locked: false
            }}
        />
        <Field
            key="pixelRatio"
            value={$currentRendering.dpr}
            on:change={(event) => $currentRendering.dpr = event.detail }
            params={{
                step: 0.1,
            }}
        />
    {/if}
</Module>
