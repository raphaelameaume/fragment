<script>
export let name;
export let grow;
export let container;

let minimized = false;

</script>

<div class="module module--{name} {minimized ? "minimized": ""}" style="flex: {grow}">
    {#if name}
        <header class="module__header">
            <div class="header__col">
                <select class="module__select">
                    <option value="sketch1">sketch1.js</option>
                    <option value="sketch2">sketch2.js</option>
                    <option value="output">Output</option>
                </select>
                <button class="header__button" aria-label="Pause">
                    <svg class="button__icon" width="18" height="18" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 6.75V17.25"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.75 6.75V17.25"></path>
                    </svg>
                </button>
                <button class="header__button" aria-label="Open in another window">
                    <svg class="button__icon" width="18" height="18" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.25 17.25H6.75C5.64543 17.25 4.75 16.3546 4.75 15.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V9.25"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.75 13.75C10.75 13.1977 11.1977 12.75 11.75 12.75H18.25C18.8023 12.75 19.25 13.1977 19.25 13.75V18.25C19.25 18.8023 18.8023 19.25 18.25 19.25H11.75C11.1977 19.25 10.75 18.8023 10.75 18.25V13.75Z"></path>
                    </svg>
                </button>
            </div>
            <div class="header__col">
                <h3 class="module__title">{name}</h3>
            </div>
            <div class="header__col">
                
                <button class="header__button" aria-label="Minimize" on:click={() => minimized = !minimized }>
                    {#if !minimized}
                        <svg class="button__icon" width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 12L8.75 12"></path>
                        </svg>
                    {:else}
                        <svg class="button__icon" width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8.75003V15.25"></path>
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 12L8.75 12"></path>
                        </svg>
                    {/if}
                </button>
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

.module__select {
    font-family: "Jetbrains Mono";
    font-size: 10px;
    padding: 1px 3px;
    border-radius: 2px;

    color: rgba(255, 255, 255, 0.75);
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.25);
    outline: 0;
}

.module__container {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
}

.module.minimized .module__container {
    display: none;
}

.header__button {
    background: transparent;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.button__icon {
    opacity: 0.5;
    transition: opacity 0.2s ease;
}

.header__button:hover .button__icon {
    opacity: 1;
}

.module__header:hover .header__button {
    opacity: 1;
}

</style>
