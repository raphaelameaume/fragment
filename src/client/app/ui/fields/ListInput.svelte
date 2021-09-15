<script>
export let disabled;
export let value;
</script>

<div class="list {disabled ? "disabled" : ""}">
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

<style>
.list {
    display: flex;
    width: 100%;
    height: 60px;
    margin-right: var(--padding);
    padding: 1px;

    background-color: var(--backgroundColor);
    border-radius: var(--borderRadius);
    box-shadow: inset 0 0 0 1px var(--borderColor);

    pointer-events: auto;
}

.ul {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 2px 0;
    overflow-y: scroll;
}

.ul::-webkit-scrollbar {
    width: 5px;               /* width of the entire scrollbar */
}

.ul::-webkit-scrollbar-track {
    background: #0E0E0E;        /* color of the tracking area */
}

.ul::-webkit-scrollbar-thumb {
    background-color: var(--activeColor);    /* color of the scroll thumb */
    border-radius: 20px;       /* roundness of the scroll thumb */
}

.list:not(.disabled):hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.list:not(.disabled):focus-within {
    box-shadow: 0 0 0 2px var(--activeColor);
}

.item {
    display: flex;
    width: 100%;

    margin: 0;
    padding: 0;
    color: var(--color);
    font-size: 10px;
    font-family: var(--fontFamily);

    opacity: 0.35;
    user-select: none;
}

.label {
    width: 100%;
    padding: 1px var(--padding);
    background-color: transparent;
    text-align: left;
}

.item:hover {
    background-color: #0E0E0E;
    opacity: 1;
}

/* :global(.field:hover) .list:not(.disabled) .item {
    opacity: 1;
} */
</style>
