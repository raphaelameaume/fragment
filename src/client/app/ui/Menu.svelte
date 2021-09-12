<script>
import { addRow as addLayoutRow } from "../stores/layout.js";
import MenuItem from "./MenuItem.svelte";

let hoverable = false;
let selectedIndex = -1;

function handleClickItem(index) {
    hoverable = selectedIndex === index ? false : true;
    selectedIndex = selectedIndex === index ?  -1 : index;
}

function handleClickOutside(event) {
    event.preventDefault();
    event.stopPropagation();

    hoverable = false;
    selectedIndex = -1;
}

$: console.log({hoverable});

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
            {
                label: "Mouse",
                actions: [
                    { label: "Enabled", handler: () => {} },
                ]
            }, {
                label: "Keyboard",
                actions: [
                    { label: "Enabled", handler: () => {} },
                ]
            }, {
                label: "MIDI",
                actions: [
                    { label: "Enabled", handler: () => {} },
                    { label: "Look for devices...", handler: () => {} },
                    { label: "Connected: MPK-Mini2" },
                ]
            }, {
                label: "Webcam",
                actions: [
                    { label: "Enabled", handler: () => {} },
                ]
            }
        ]} />
    </ul>
</div>

<svelte:window on:click={handleClickOutside} />

<style>

.menu {
    display: flex;
    align-items: center;
    padding: 0 4px;
}

.menu__list {
    display: flex;
}
</style>
