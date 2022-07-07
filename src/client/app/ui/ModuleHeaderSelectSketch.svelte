<script>
import { createEventDispatcher, getContext, onMount } from "svelte"; 
import ModuleHeaderAction from "./ModuleHeaderAction.svelte";
import { sketchFiles } from "@fragment/props";
import { all as allSketches, current as currentSketches } from "../stores/sketches.js";

export let index;

$: options = [
    ...Object.keys($allSketches).map((key) => ({
        value: key,
        label: $allSketches[key].name ? $allSketches[key].name : key,
    })),
];

$: {
    if (sketchFiles.length > 1) {
        options = [
            ...options,
            { value: "output", label: "output" },
        ];
    }
}


function handleChangeSelect(event) {
    $currentSketches[index] = event.currentTarget.value;
};

</script>

<ModuleHeaderAction
    value={$currentSketches[index]}
    permanent
    border
    on:change={handleChangeSelect}
    options={options}
/>
