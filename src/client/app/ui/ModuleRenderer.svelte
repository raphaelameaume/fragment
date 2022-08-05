<script context="module">
export let moduleNames = [
    "monitor",
    "params",
    "mouse",
    "midi",
    "keyboard",
    "console",
    "exports",
];

let MODULE_ID = 0; 

export let getModuleID = () => {
    return MODULE_ID++;
};

</script>

<script>
import Monitor from "../modules/Monitor.svelte";
import Console from "../modules/Console.svelte";
import Output from "../modules/Output.svelte";
import Params from "../modules/Params.svelte";
import MousePanel from "../modules/MousePanel.svelte";
import MidiPanel from "../modules/MidiPanel.svelte";
import KeyboardPanel from "../modules/KeyboardPanel.svelte";
import Exports from "../modules/Exports.svelte";
import { getContext } from "svelte";
// import Appearance from "../modules/Appearance.svelte";
// import AudioAnalyser from "../modules/AudioAnalyser.svelte";

const parent = getContext('parent');

export let mID;
export let name;

const moduleList = {
    "monitor": Monitor,
    "params": Params,
    "mouse": MousePanel,
    "midi": MidiPanel,
    "keyboard": KeyboardPanel,
    "console": Console,
    "exports": Exports,
    "output": Output,
};

$: component = moduleList[name];

const current = {
    mID: !isNaN(mID) ? mID : MODULE_ID++,
    type: "module",
    name,
};

MODULE_ID = Math.max(MODULE_ID, !isNaN(current.mID) ? current.mID + 1 : 0);

parent.registerChild(current);

const m = getContext('module');
m.set(current);

</script>

<svelte:component this={component} />
