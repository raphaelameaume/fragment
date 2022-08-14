<script context="module">
import { writable } from "svelte/store";

export const params = writable([]);

let ID = 0;

</script>

<script>
import { onMount, onDestroy } from "svelte";
import { props } from "../stores";
import { monitors } from "../modules/Monitor.svelte";
import { all as sketches } from "../stores/sketches.js";

import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";
import OutputParams from "../ui/OutputParams.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

let id = ID++;
let selected = id;
let sketchKey, sketchProps = {};

onMount(() => {
    if ($params.length === 1) {
        selected = "output";
    }

    params.update((all) => {
        return [
            ...all,
            {
                id,
            }
        ]
    })
});

onDestroy(() => {
    params.update((all) => {
        return all.filter(m => m.id !== id);
    });
});

$: options = [
    ...$monitors.map((monitor, index) => {
        return { value: index, label: `monitor ${index + 1}`}
    }),
    ...$params.length > 1 ? [{ value: "output", label: "output"}] : [],
];

$: monitor = $monitors[Math.min(selected, $monitors.length - 1)];
$: sketchKey = monitor ? monitor.selected : undefined;
$: sketch = $sketches[sketchKey];
$: sketchProps = $props[sketchKey];

</script>

<Module name={`Parameters`}>
    <div slot="header-right">
        {#if options.length > 1 }
        <ModuleHeaderAction
            value={selected}
            permanent
            border
            on:change={(event) => selected = event.currentTarget.value}
            options={options}
        />
        {/if }
    </div>
    {#if $params.length === 1 || selected === "output" }
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

                        if (typeof $props[sketchKey][key].onChange === 'function') {
                            $props[sketchKey][key].onChange($props[sketchKey][key]);
                        }
                    }}
                />
            {/each}
        {/if}
    {/if}
</Module>
