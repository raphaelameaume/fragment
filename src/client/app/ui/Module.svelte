<script>
import ModuleHeaderAction from "./ModuleHeaderAction.svelte";
import ModuleHeaderSelect from "./ModuleHeaderSelect.svelte";
export let name;
export let grow;
export let container;

let minimized = false;

</script>

<div class="module module--{name} {minimized ? "minimized": ""}" style="flex: {grow}">
    {#if name}
        <header class="module__header">
            <div class="header__col">
                <slot name="header-left"></slot>
            </div>
            <div class="header__col">
                <h3 class="module__title">{name}</h3>
            </div>
            <div class="header__col">
                <ModuleHeaderAction label="Minimize" on:click={() => minimized = !minimized }>
                    {#if !minimized}
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 12L8.75 12"></path>
                        </svg>
                    {:else}
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8.75003V15.25"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 12L8.75 12"></path>
                        </svg>
                    {/if}
                </ModuleHeaderAction>
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
    color: white;
    font-size: 10px;
    text-transform: capitalize;
}

.module__container {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
}

.module.minimized .module__container {
    display: none;
}
</style>
