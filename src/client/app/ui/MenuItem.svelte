<script>
import MenuSublist from "./MenuSublist.svelte";
import MenuSubItem from "./MenuSubItem.svelte";

export let label;
export let index;
export let selected;
export let actions = [];
export let hoverable;
export let onClick;

let selectedAction = -1;

function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    onClick(index);
}

function handleMouseEnter(event) {
    if (hoverable && !selected) {
        onClick(index);
    }
}

function handleSubMouseEnter(index) {
    selectedAction = index;
}

</script>

<li class="list__item { selected ? `list__item--selected` : `` }">
    <button class="item__label" on:click={handleClick} on:mouseenter={handleMouseEnter}>{label}</button>
    <MenuSublist
        visible={selected}
        actions={actions}
        style="top: 100%"
    />
</li>

<style>

.list__item {
    position: relative;
    display: flex;
    cursor: default;
    padding: 4px;
    border-radius: 2px 2px 0 0;
}

.list__item--selected {
    background-color: #177bd0;
}

.item__label {
    color: #f0f0f0;
    font-size: 12px;
    padding: 0 8px;
    /* font-weight: 600; */
    border: none;
    background: none;
    user-select: none;
}
</style>
