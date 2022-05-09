<script context="module">
let instances = 0;
</script>

<script>
import { getContext, onDestroy, onMount, setContext } from "svelte";
import { sketchesCount } from "@fragment/props";
import { props } from "../stores";
import { monitors } from "../stores/rendering.js";
import { current as sketches } from "../stores/sketches.js";

import Module from "../ui/Module.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import FieldSpace from "../ui/FieldSpace.svelte";
import Field from "../ui/Field.svelte";
import OutputParams from "../ui/OutputParams.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";
import * as triggersMap from "../triggers/index.js";

let index = instances;
instances++;

let currentModule = getContext("currentModule");
let selected = index;
let options = [], sketch, sketchProps = {};

$: {
    options = $monitors.map((monitor) => {
        return { value: monitor.index, label: `monitor ${monitor.index}`}
    });

    if ($monitors.length > selected) {
        let sketchKey = $monitors[selected].selected;

        sketch = $sketches[sketchKey];
        sketchProps = (sketch && sketch.props) ? sketch.props : {};
    }

    $currentModule.params.selected = selected;
}

onMount(() => {
    if (!selected) {
        const lastOption = options[Math.min(index, options.length - 1)];

        if (lastOption) {
            selected = lastOption.value;
            $currentModule.params.selected = selected;
        }
    }
});

onDestroy(() => {
    instances--;
})

function handleChangeSelect(event) {
    selected = Number(event.currentTarget.value);
}

</script>

<Module name="Parameters">
    <div slot="header-right">
        {#if $monitors.length > 1 }
        <ModuleHeaderAction
            value={selected}
            permanent
            border
            on:change={handleChangeSelect}
            options={options}
        />
        {/if }
    </div>
    {#if Number(selected) === $monitors.length - 1 && sketchesCount === 1}
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
                    context={sketch}
                    key={key}
                    value={sketchProps[key].value}
                    params={sketchProps[key].params}
                    type={sketchProps[key].type}
                    triggers={sketchProps[key].triggers}
                    on:change={(event) => {
                        sketchProps[key].value = event.detail;
                        sketch.props[key].value = event.detail;
                    }}
                />
            {/each}
        {/if}
    {/if}
    {#if !sketch}
        <OutputParams />
    {/if}
</Module>
