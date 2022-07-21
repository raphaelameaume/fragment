<script context="module">
export let moduleNames = [
    "monitor",
    "params",
    "mouse",
    "midi",
    "keyboard",
    "console",
    "exports",
    "output",
    "appearance",
];

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
import Appearance from "../modules/Appearance.svelte";

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
    "appearance": Appearance
};

$: component = moduleList[name];

const parent = getContext('parent');

const current = {
    type: "module",
    name,
};

parent.registerChild(current);

const module = getContext('module');
$module.name = name;

// module.subscribe(() => {
//     console.log("change current name");
//     current.name = $module.name;
// });

</script>

<svelte:component this={component} />
