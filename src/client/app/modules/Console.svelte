<script>
import Module from "../ui/Module.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";
import { current as currentLogs } from "../stores/console";
import ConsoleLine from "./Console/ConsoleLine.svelte";

// let logs = [
//     { level: "", args: ["hello world"], count: 4 },
//     { level: "", args: [{"key": "value"}]},
//     { level: "", args: [["hello", "world", "hello"]]},
//     { level: "", args: ["hello world"]},
//     { level: "error", args: ["Uncaughted promise"]},
// ];

$: logs = $currentLogs;

function clear() {
    $currentLogs = [];
}

// let log = console.log;

// console.log = (...args) => {
//     logs = [...logs, { level: "", args }];

//     log(...args);
// };

</script>

<Module name="Console">
    <svelte:fragment slot="header-right">
        <ModuleHeaderAction border label="Clear" on:click={() => clear()}>clear</ModuleHeaderAction>
    </svelte:fragment>
    <div class="container">
        <div class="list">
            {#each logs as log}
                <ConsoleLine {log} />
            {/each}        
        </div>
    </div>
</Module>

<style>
.container {
    padding: 4px;
}

.list {
    margin-right: var(--padding);
    padding: 1px 1px;
    height: 120px;

    background-color: #1d1d1e;
    border-radius: var(--inputBorderRadius);
    box-shadow: inset 0 0 0 1px var(--inputBorderColor);
    overflow-y: scroll;
}

.list::-webkit-scrollbar {
    width: 5px;               /* width of the entire scrollbar */
}

.list::-webkit-scrollbar-track {
    background-color: var(--color-lightblack);        /* color of the tracking area */
}

.list::-webkit-scrollbar-thumb {
    background-color: var(--activeColor);    /* color of the scroll thumb */
    border-radius: 20px;       /* roundness of the scroll thumb */
}

</style>
