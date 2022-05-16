<script context="module">
let instances = 0;
</script>

<script>
import { getContext, onDestroy, onMount } from "svelte";
import { sketchesCount } from "@fragment/props";
import { props } from "../stores";
import { monitors } from "../stores/rendering.js";
import { current as sketches } from "../stores/sketches.js";

import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";
import OutputParams from "../ui/OutputParams.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

let currentModule = getContext("currentModule");
let index = isFinite($currentModule.params.index) ? $currentModule.params.index : instances;
instances++;

$currentModule.params.index = index;

let selected = isFinite($currentModule.params.selected) ? $currentModule.params.selected : index;
let options = [], sketchKey, sketchProps = {};

$: {
    options = $monitors
        .sort((a, b) => a.index < b.index ? -1 : 1)
        .map((monitor) => {
            return { value: monitor.index, label: `monitor ${monitor.index}`}
        })


    if ($monitors.length > selected) {
        sketchKey = $monitors[selected].selected;
    }

    $currentModule.params.selected = selected;
}

onMount(() => {
    if (!selected) {
        const lastOption = options[Math.min(index, options.length - 1)];

        if (lastOption) {
            selected = lastOption.value;
        }
    }
});

onDestroy(() => {
    instances--;
})

function handleChangeSelect(event) {
    selected = Number(event.currentTarget.value);
}

$: sketch = $sketches[sketchKey];
$: sketchProps = $props[sketchKey];

</script>

<Module name={`Parameters`}>
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
            <Field key="framerate" value={isFinite(sketch.fps) ? sketch.fps : 60} params={{disabled: true}}/>
            {#if sketch.duration && sketch.duration > 0 }
                <Field key="duration" value={sketch.duration} params={{disabled: true, suffix: "s"}}/>
            {/if }
            {#each Object.keys(sketchProps) as key, i}
                <Field
                    context={sketchKey}
                    key={key}
                    value={sketchProps[key].value}
                    params={sketchProps[key].params || {}}
                    type={sketchProps[key].type}
                    triggers={sketchProps[key].triggers || []}
                    on:click={() => {
                        $props[sketchKey][key].value._refresh = true;
                    }}
                    on:change={(event) => {
                        $props[sketchKey][key].value = event.detail;
                    }}
                />
            {/each}
        {/if}
    {/if}
    {#if !sketch}
        <OutputParams />
    {/if}
</Module>
