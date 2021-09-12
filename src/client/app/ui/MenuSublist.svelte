<script>
import MenuSubItem from "./MenuSubItem.svelte";

export let actions = [];
export let visible;
export let style = "";

let selectedAction = -1;

function handleSubMouseEnter(index) {
    selectedAction = index;
}

</script>

<ul class="sublist {visible ? "sublist--visible" : "" }" style="{style}">
    {#each actions as action, actionIndex}
        <MenuSubItem
            label={action.label}
            index={actionIndex}
            actions={action.actions}
            selected={actionIndex === selectedAction}
            onMouseEnter={handleSubMouseEnter}
            handler={action.handler}
        />
    {/each}
</ul>

<style>
.sublist {
    position: absolute;
    left: 0;
    z-index: 100;

    display: none;
    padding-top: 4px;
    padding-bottom: 4px;
    border-radius: 0 0 2px 2px;

    background-color: rgba(20, 20, 20, 0.75);
    backdrop-filter: blur(2px);
}

.sublist--visible {
    display: block;
}

</style>
