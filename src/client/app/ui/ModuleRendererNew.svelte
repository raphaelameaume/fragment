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

export let name;

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

$: component = moduleList[name];

const parent = getContext('parent');

parent.registerChild({
    type: "module",
    name,
});

</script>

<svelte:component this={component} />
