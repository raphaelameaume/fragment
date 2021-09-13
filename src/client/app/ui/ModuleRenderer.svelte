<script>
import Monitor from "../modules/Monitor.svelte";
import OutputMonitor from "../modules/OutputMonitor.svelte";
import StageSelector from "../modules/StageSelector.svelte";

export let module;

const moduleList = {
    "monitor": Monitor,
    "stage-selector": StageSelector,
    "output-monitor": OutputMonitor
};

const component = moduleList[module.name];

</script>

<svelte:component this={component} grow={module.grow} />
