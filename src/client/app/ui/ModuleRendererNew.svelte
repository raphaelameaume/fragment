<script context="module">
let moduleCount = new Map();
</script>

<script>
import { setContext, getContext, onMount, onDestroy } from "svelte";
import { get, writable } from "svelte/store";
import { current as currentLayout } from "../stores/layout.js";
import Monitor from "../modules/Monitor.svelte";
import Console from "../modules/Console.svelte";
import Output from "../modules/Output.svelte";
import Params from "../modules/Params.svelte";
import MousePanel from "../modules/MousePanel.svelte";
import MidiPanel from "../modules/MidiPanel.svelte";
import KeyboardPanel from "../modules/KeyboardPanel.svelte";
import Exports from "../modules/Exports.svelte";

export let module;
export let index;

const moduleList = {
    "monitor": Monitor,
    "params": Params,
    "mouse": MousePanel,
    "midi": MidiPanel,
    "keyboard": KeyboardPanel,
    "console": Console,
    "exports": Exports,
    "output": Output
};

Object.keys(moduleList).forEach(() => {
    if (!moduleCount.has(module.name)) {
        moduleCount.set(module.name, 0);
    }
})

$: component = moduleList[module.name];

moduleCount.set(module.name, moduleCount.get(module.name) + 1);

// onMount(() => {
//     console.log(module.name, moduleCount.get(module.name));
// });

onDestroy(() => {
    moduleCount.set(module.name, moduleCount.get(module.name) - 1);
});

setContext("moduleIndex", index);

</script>

<svelte:component this={component} />
