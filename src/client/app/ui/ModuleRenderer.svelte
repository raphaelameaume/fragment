<script>
import { setContext } from "svelte";
import Monitor from "../modules/Monitor.svelte";
import Params from "../modules/Params.svelte";
import MousePanel from "../modules/MousePanel.svelte";
import MidiPanel from "../modules/MidiPanel.svelte";
import KeyboardPanel from "../modules/KeyboardPanel.svelte";

export let module;
export let index;

const moduleList = {
    "monitor": Monitor,
    "params": Params,
    "mouse": MousePanel,
    "midi": MidiPanel,
    "keyboard": KeyboardPanel
};

const component = moduleList[module.name];

setContext("moduleIndex", index);

</script>

<svelte:component this={component} grow={module.grow} />
