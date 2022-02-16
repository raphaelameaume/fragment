<script>
import { setContext, getContext } from "svelte";
import { writable } from "svelte/store";
import { current as currentLayout } from "../stores/layout.js";
import Monitor from "../modules/Monitor.svelte";
import Console from "../modules/Console.svelte";
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
};

const component = moduleList[module.name];

setContext("moduleIndex", index);

let rowIndex = getContext("rowIndex");
let colIndex = getContext("colIndex");

const currentModule = writable($currentLayout.rows[rowIndex].cols[colIndex].modules[index]);

currentModule.subscribe((value) => {
    $currentLayout.rows[rowIndex].cols[colIndex].modules[index] = value;
});

if (!$currentModule.params) {
    $currentModule = {
        ...$currentModule,
        params: {}
    }
}
setContext("currentModule", currentModule);

</script>

<svelte:component this={component} />
