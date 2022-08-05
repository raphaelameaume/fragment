<script>
import { current as currentLayout } from "../stores/layout.js";

export let name;
export let scrollable = true;
export let hasHeader = true;
</script>

<div class="module module--{name}" class:scrollable={scrollable} class:no-header={!hasHeader} class:editing={$currentLayout.editing}>
    {#if hasHeader && name}
        <header class="module__header" >
            <div class="header__col">
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
    <div class="module__container">
        <slot></slot>
    </div>
</div>

<style>
.module {
    --header-height: 25px;

    display: grid;
    grid-template-rows: 25px minmax(0px, auto);
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
}

.module.no-header {
    --header-height: 0px;
}

.module__header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    height: var(--header-height);
    flex-shrink: 0;
    align-items: center;

    background-color: var(--color-lightblack);
}

.slot {
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
    cursor: pointer;
}

.module__container {
    position: relative;
}

.module.scrollable .module__container {
    overflow-y: auto;
}

.module.editing.scrollable .module__container {
    overflow-y: hidden;
}

.module__container::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}

.module__container::-webkit-scrollbar-track {
    background: transparent;        /* color of the tracking area */
}

.module__container::-webkit-scrollbar-thumb {
    background-color: var(--color-active);    /* color of the scroll thumb */
    border-radius: 20px;/*       roundness of the scroll thumb*/
}

.module.minimized .module__container {
    display: none;
}

.footer {
    height: var(--height-input);
}
</style>
