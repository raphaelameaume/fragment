<script context="module">
export let moduleNames = [
    "monitor",
    "params",
    "midi",
    "console",
    "exports",
];
</script>

<script>
import Monitor from "../modules/Monitor.svelte";
import Console from "../modules/Console.svelte";
import Params from "../modules/Params.svelte";
import MidiPanel from "../modules/MidiPanel.svelte";
import Exports from "../modules/Exports.svelte";
import Module from "./Module.svelte";

export let mID = undefined;
export let name;
export let hasHeader = true;

const moduleList = {
    "monitor": Monitor,
    "params": Params,
    "midi": MidiPanel,
    "console": Console,
    "exports": Exports,
};

$: component = moduleList[name];
</script>

{#if component}
    <svelte:component this={component} {mID} {hasHeader} />
{:else}
    <Module hasHeader={false} {mID}/>
{/if}
