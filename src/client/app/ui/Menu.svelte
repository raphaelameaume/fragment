<script>
import { addRow as addLayoutRow } from "../stores/layout.js";
import MenuItem from "./MenuItem.svelte";

let hoverable = false;
let selectedIndex = -1;

function handleClickItem(index) {
    selectedIndex = index;
    hoverable = true;
}

function handleClickOutside(event) {
    event.preventDefault();
    event.stopPropagation();

    hoverable = false;
    selectedIndex = -1;
}

</script>

<div class="menu">
    <ul class="menu__list">
        <MenuItem index={0} selected={selectedIndex === 0} hoverable={hoverable} onClick={handleClickItem} label="Layout" actions={[
            { label: "Edit...", handler: () => {} },
            { label: "Save current as...", handler: () => {} },
            { label: "Switch to", actions: [] },
            { label: "Add row", handler: addLayoutRow },
        ]} />
        <MenuItem index={1} selected={selectedIndex === 1} hoverable={hoverable} onClick={handleClickItem} label="Inputs" actions={[
            { label: "Mouse", handler: () => {} },
            { label: "Keyboard", handler: () => {} },
            { label: "MIDI", actions: [] },
            { label: "Webcam", handler: addLayoutRow },
        ]} />
    </ul>
</div>

<svelte:window on:click={handleClickOutside} />

<style>

.menu__list {
    display: flex;
}
</style>
