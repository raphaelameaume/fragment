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
    height: 80px;
    margin-right: var(--padding);
    padding: 1px 0;

    background-color: #1d1d1e;
    border-radius: var(--inputBorderRadius);
    box-shadow: inset 0 0 0 1px var(--inputBorderColor);

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

.item {
    display: flex;
    width: 100%;

    margin: 0;
    padding: 0 3px;
    color: var(--inputColor);
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

.list:not(.disabled) .label:hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.list:not(.disabled) .label:active {
    box-shadow: 0 0 0 2px var(--activeColor);
}

.item:hover {
    /* background-color: #0E0E0E; */
    opacity: 1;
}

/* :global(.field:hover) .list:not(.disabled) .item {
    opacity: 1;
} */
</style>
