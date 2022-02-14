<script context="module">
let instances = 0;
</script>

<script>
import { getContext, onMount, setContext } from "svelte";
import { sketchesCount } from "@fragment/props";
import { current as currentLayout } from "../stores/layout.js";
import { props } from "../stores";
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentSketches } from "../stores/sketches.js";

import Module from "../ui/Module.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import FieldSpace from "../ui/FieldSpace.svelte";
import Field from "../ui/Field.svelte";
import OutputParams from "../ui/OutputParams.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";
import * as triggersMap from "../triggers/index.js";

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

        if (sketch && sketch.props) {
            Object.keys(sketch.props).forEach(key => {
                let prop = sketch.props[key];

                prop._listeners = [];

                prop.onChange = (fn) => {
                    prop._listeners.push(fn);

                    return () => {
                        let index = prop._listeners.findIndex((listener) => listener === fn);

                        if (index >= 0) {
                            prop._listeners.splice(index, 1);
                        }
                    };
                };
            });
        }
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

$: sketchProps = $props[selectedSketch] || {};

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
        <OutputParams />
    {/if}

    {#if sketch }
        {#if typeof props === "object"}
            <Field key="framerate" value={sketch.fps ? sketch.fps : 60} params={{disabled: true}}/>
            {#if sketch.duration && sketch.duration > 0 }
                <Field key="duration" value={sketch.duration} params={{disabled: true, suffix: "s"}}/>
            {/if }
            {#each Object.keys(sketchProps) as key, i}
                <Field
                    context={selectedSketch}
                    key={key}
                    value={sketchProps[key].value}
                    params={sketchProps[key].params}
                    type={sketchProps[key].type}
                    triggers={sketchProps[key].triggers}
                    on:change={(event) => {
                        sketchProps[key].value = event.detail;
                        sketch.props[key].value = event.detail;

                        // if (sketch.props._listeners.length > 0) {
                        //     sketch.props._listeners.forEach((listener) => listener(event.detail));
                        // }
                        // props.update((current) => ({
                        //     ...current,
                        //     [`${selectedSketch}`]: {
                        //         ...current[`${selectedSketch}`],
                        //         [`${key}`]: {
                        //             ...current[`${selectedSketch}`][key],
                        //             value: event.detail,
                        //         }
                        //     }
                        // }));
                    }}
                />
            {/each}
        {/if}
    {/if}
    {#if Number(selected) === monitors.length - 1 && sketchesCount > 1}
        <OutputParams />
    {/if}
</Module>
