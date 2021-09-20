<script>
import { getContext } from "svelte";
import { current as currentLayout } from "../stores/layout.js";
import ModuleHeaderAction from "./ModuleHeaderAction.svelte";
import ModuleHeaderSelect from "./ModuleHeaderSelect.svelte";


export let name;
export let grow;
export let container;

let minimized = false;

let style = "";

let rowIndex = getContext("rowIndex");
let colIndex = getContext("colIndex");
let index = getContext("moduleIndex");

let current = $currentLayout.rows[rowIndex].cols[colIndex].modules[index];

$: {
    if (current.resizing) {
        style = `flex: ${current.grow}`;
    } else {
        const modulesInCol = $currentLayout.rows[rowIndex].cols[colIndex].modules;

        if (modulesInCol && modulesInCol.length > 0) {
            const total = modulesInCol.reduce((t, m) => {
                return t + m.grow;
            }, 0);
            const height = grow / total;

            style = `flex: 0 0 auto;`;

            if (height > 0) {
                style += `height: ${height * 100}%`;
            } else {
                style += `height: ${100 / modulesInCol.length}%`;
            }
        }
    }
}

</script>

<div class="module module--{name}" class:minimized={minimized} style={style}>
    {#if name}
        <header class="module__header">
            <div class="header__col">
                <ModuleHeaderAction margin={false} label="Close" on:click={() => minimized = !minimized }>
                    <div slot="icon">
                        <svg style="color: #FF4135" width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 9.75L14.25 14.25"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.25 9.75L9.75 14.25"></path>
                        </svg>
                    </div>
                </ModuleHeaderAction>
                <ModuleHeaderAction margin={false} label="Minimize" on:click={() => minimized = !minimized }>
                    <div slot="icon">
                    {#if !minimized}
                        <svg style="color: #FFB837" width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 12L8.75 12"></path>
                        </svg>
                    {:else}
                        <svg style="color: #FFB837" width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8.75003V15.25"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 12L8.75 12"></path>
                        </svg>
                    {/if}
                    </div>
                </ModuleHeaderAction>
                <div class="slot slot--left">
                    <slot name="header-left"></slot>
                </div>
            </div>
            <div class="header__col">
                <h3 class="module__title">{name}</h3>
            </div>
            <div class="header__col">
                <div class="slot slot--right">
                    <slot name="header-right"></slot>
                </div>
            </div>
        </header>
    {/if}
    <div class="module__container" bind:this={container}>
        <slot></slot>
    </div>
</div>

<style>
.module {
    display: flex;
    flex-direction: column;
}

.module__header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    height: 25px;
    align-items: center;
    font-family: "Jetbrains Mono";

    background: #0E0E0E;
}

:global(.slot > div) {
    display: flex;
    align-items: center;
}

.header__col {
    display: flex;
    padding: 0 6px;
    justify-content: center;
    align-items: center;
}

.header__col:first-child {
    justify-content: flex-start;
}

.header__col:last-child {
    justify-content: flex-end;
}

.module__title {
    user-select: none;

    color: white;
    font-size: 10px;
    text-transform: capitalize;
}

.module__container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    max-height: calc(100% - 25px);

    /* background-color: red; */
}

.module.minimized .module__container {
    display: none;
}
</style>
