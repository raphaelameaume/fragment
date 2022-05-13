<script>
import { afterUpdate } from "svelte";

export let disabled;
export let value = null;
export let name = "";

let container;

afterUpdate(() => {
    container.scrollTo(0, container.scrollHeight);
});

</script>

<div class="list {disabled ? "disabled" : ""}">
    <div class="container" bind:this={container}>
        <ul class="ul">
            {#each value as item, index}
                <li class="item">
                    {#if disabled }
                        <span class="label">{item}</span>
                    {:else}
                        <button class="label">{item}</button>
                    {/if}
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
.list {
    width: 100%;

    pointer-events: auto;
}

.container {
    margin-right: var(--padding);
    padding: 1px 0;
    height: 80px;

    background-color: #1d1d1e;
    border-radius: var(--border-radius-input);
    box-shadow: inset 0 0 0 1px var(--color-border-input);
    overflow-y: scroll;
}

.ul {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 2px 0;
    
}

.container::-webkit-scrollbar {
    width: 5px;               /* width of the entire scrollbar */
}

.container::-webkit-scrollbar-track {
    background-color: var(--color-lightblack);        /* color of the tracking area */
}

.container::-webkit-scrollbar-thumb {
    background-color: var(--color-active);    /* color of the scroll thumb */
    border-radius: 20px;       /* roundness of the scroll thumb */
}

.item {
    display: flex;
    width: 100%;

    margin: 0;
    padding: 0 3px;
    color: var(--color-text);
    font-size: 10px;

    opacity: 0.35;
    user-select: none;
}

.label {
    width: 100%;
    padding: 1px var(--padding);
    background-color: transparent;
    text-align: left;
}

.list:not(.disabled) .label:hover {
    box-shadow: inset 0 0 0 1px var(--color-active);
}

.list:not(.disabled) .label:active {
    box-shadow: 0 0 0 2px var(--color-active);
}

.item:hover {
    /* background-color: #0E0E0E; */
    opacity: 1;
}

/* :global(.field:hover) .list:not(.disabled) .item {
    opacity: 1;
} */
</style>
