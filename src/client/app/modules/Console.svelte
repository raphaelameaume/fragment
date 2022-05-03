<script>
import Module from "../ui/Module.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";
import { current as currentLogs } from "../stores/console";
import ConsoleLine from "./Console/ConsoleLine.svelte";

$: logs = $currentLogs;

function clear() {
    $currentLogs = [];
}

</script>

<Module name="Console" scrollable={false}>
    <svelte:fragment slot="header-right">
        <ModuleHeaderAction border label="Clear" on:click={() => clear()}>clear</ModuleHeaderAction>
    </svelte:fragment>
    <div class="container">
        <div class="list">
            <div class="scroll">
                {#each logs as log}
                    <ConsoleLine {log} />
                {/each}
            </div>
        </div>
    </div>
</Module>

<style>
.container {
    position: relative;
    
    height: 100%;
    max-height: 100%;
    padding: 4px;
}

.list {
    position: relative;

    margin-right: var(--padding);
    padding: 1px 1px;

    height: 100%;
    max-height: 100%;

    background-color: #1d1d1e;
    border-radius: var(--inputBorderRadius);
    box-shadow: inset 0 0 0 1px var(--inputBorderColor);
}

.scroll {
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
}

.scroll::-webkit-scrollbar {
    width: 5px;               /* width of the entire scrollbar */
}

.scroll::-webkit-scrollbar-track {
    background-color: var(--color-lightblack);        /* color of the tracking area */
}

.scroll::-webkit-scrollbar-thumb {
    background-color: var(--activeColor);    /* color of the scroll thumb */
    border-radius: 20px;       /* roundness of the scroll thumb */
}

</style>
