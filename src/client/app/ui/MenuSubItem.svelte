<script>
import MenuSublist from "./MenuSublist.svelte";

export let index;
export let handler;
export let actions;
export let label;
export let onMouseEnter;
export let selected;

function handleMouseEnter() {
    if ((actions && actions.length > 0) || handler) {
        onMouseEnter(index);
    }
}

function handleMouseLeave() {

}

</script>

<li class="sublist__item { selected ? `sublist__item--selected` : `` }" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
    {#if handler }
        <button class="sublist__label" on:click={handler}>{label}</button>
    {:else}
        <span class="sublist__label { (!actions || actions.length === 0) ? "sublist__label--disabled" : ""}">{label}</span>
        {#if actions && actions.length > 0}
            <span class="sublist__icon">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.75 8.75L14.25 12L10.75 15.25"/>
                </svg>
            </span>
            <MenuSublist
                actions={actions}
                visible={selected}
                style="top: -4px; left: 100%; border-radius: 0 2px 2px 2px;"
            />
        {/if}
    {/if}
</li>

<style>
.sublist__item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 2px 32px 2px 24px;
    justify-content: space-between;
    height: 20px;
}

.sublist__label {
    width: max-content;
    background: none;
    border: none;
    font-size: 12px;
    color: #f0f0f0;
    padding: 0;
    margin: 0;
}

.sublist__label--disabled {
    color: rgba(255, 255, 255, 0.5);
}

.sublist__item--selected {
    background-color: rgba(23, 123, 208, 0.5);
}

.sublist__icon {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0px;

    display: flex;
    align-items: center;

    color: #f0f0f0;
}
</style>
