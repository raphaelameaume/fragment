<script>
import Monitor from "../modules/Monitor.svelte";

export let module;

const moduleList = {
    "monitor": Monitor,
};

const component = moduleList[module.name];
</script>

<svelte:component this={component} />
