<script>
import { current as currentLayout } from "../stores/layout.js";

export let index;
export let style = "top: 0";

function handleDelete() {
    deleteRow(index);
}

function handleColumnAdd() {
    addColumn(index);
}

function handleMoveUp() {
    changeRowIndex(index, index - 1);
}

function handleMoveDown() {
    changeRowIndex(index, index + 1);
}

</script>

<header class="header" style={style}>
    {#if index >= 0 }
    <button on:click={handleColumnAdd} class="button" aria-label="Add column">
        <svg fill="none" viewBox="0 0 24 24" class="button__icon">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75Z"/>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 5V19"/>
        </svg>
    </button>
    {#if index !== 0}
    <button on:click={handleMoveUp} class="button" aria-label="Move down">
        <svg fill="none" viewBox="0 0 24 24" class="button__icon">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.25 10.25L12 4.75L6.75 10.25"></path>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19.25V5.75"></path>
        </svg>
    </button>
    {/if}
    {#if index !== $currentLayout.rows.length - 1}
    <button on:click={handleMoveDown} class="button" aria-label="Move down">
        <svg fill="none" viewBox="0 0 24 24" class="button__icon">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.25 13.75L12 19.25L6.75 13.75"></path>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18.25V4.75"></path>
        </svg>
    </button>
    {/if}
    <button on:click={handleDelete} class="button" aria-label="Delete row">
        <svg fill="none" viewBox="0 0 24 24" class="button__icon">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 7.75L7.59115 17.4233C7.68102 18.4568 8.54622 19.25 9.58363 19.25H14.4164C15.4538 19.25 16.319 18.4568 16.4088 17.4233L17.25 7.75"></path>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 7.5V6.75C9.75 5.64543 10.6454 4.75 11.75 4.75H12.25C13.3546 4.75 14.25 5.64543 14.25 6.75V7.5"></path>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 7.75H19"></path>
        </svg>
    </button>
    {/if}
    {#if index === undefined || index < 0 }
    <button on:click={addRow} class="button" aria-label="Add row">
        <svg fill="none" viewBox="0 0 24 24" class="button__icon">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 5.75V18.25"></path>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.25 12L5.75 12"></path>
        </svg>
    </button>
    {/if}
</header>

<style>
.header {
    z-index: 2;

    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-grow: 0;
    height: 24px;
    border-radius: 2px 2px 0 0;

    backdrop-filter: blur(4px);
    background-color: rgba(218, 21, 31, 0.2);
}

.button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin: 0 2px;
    padding: 0;

    border: 1px solid #fff;
    border-radius: 2px;
    background-color: transparent;

    color: #fff;
}

.button__icon {
    width: 14px;
    height: 14px;
}

</style>
