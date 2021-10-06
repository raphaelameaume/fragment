<script>
import { createEventDispatcher, getContext, onMount } from "svelte"; 
import ModuleHeaderAction from "./ModuleHeaderAction.svelte";
import { sketchFiles } from "@fragment/props";
import { current as currentSketches } from "../stores/sketches.js";
import { reset as resetMouseEvents } from "../triggers/Mouse.js";

export let index;

const dispatch = createEventDispatcher();

let pristine = false;
let options = [
    ...Object.keys($currentSketches).map((key) => ({
        value: key,
        label: $currentSketches[key].name ? $currentSketches[key].name : key,
    })),
];

if (sketchFiles.length > 1) {
    options = [
        ...options,
        { value: "output", label: "output" },
    ];
}

let currentModule = getContext("currentModule");
let sketchFile = options.map((option) => option.value).includes($currentModule.params.selected) ? $currentModule.params.selected : null;

if (!pristine && !sketchFile && options.length) {
    sketchFile = options[Math.min(index, options.length - 1)].value;
    $currentModule.params.selected = sketchFile;
}


onMount(() => {
    dispatch("change", sketchFile);
});

function handleChangeSelect(event) {
    // remove previous events registered
    resetMouseEvents(sketchFile);

    sketchFile = event.currentTarget.value;
    $currentModule.params.selected = sketchFile;

    pristine = true;

    dispatch("change", sketchFile)
};

</script>

<ModuleHeaderAction
    value={sketchFile}
    permanent
    border
    on:change={handleChangeSelect}
    options={options}
/>
