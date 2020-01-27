<div class="dropdown" style={style}>
    <button class="button" on:click={toggle} bind:this={button}>
        <span class="toggle">
            {#if opened}
            <IconArrowBottom/>
            {:else}
            <IconArrowRight/>
            {/if}
        </span>
        <span class="label">{title}</span>
    </button>
    <div class="content {classNameVisible}">
        <slot></slot>
    </div>
</div>

<script>
import IconArrowRight from "./svg/IconArrowRight.svelte";
import IconArrowBottom from "./svg/IconArrowBottom.svelte";
import { Storage } from "../core/Storage.js";

export let title = "";
export let opened = true;
export let style = "";
export let url = "";
let button;

$: classNameVisible = opened ? 'visible' : '';

$: {
    if (url.length > 0) {
        Storage.rehydrate(url, (value) => {
            opened = value.opened;
        })
    }
}
$: {
    

    if (url.length > 0) {
        Storage.set(url, JSON.stringify({ opened }));
    }
    
    
}


function toggle() {
    opened = !opened;

    button.blur();
}

</script>

<style>
.button {
    position: relative;

    display: flex;
    width: 100%;
    padding: 4px;
    margin: 0;
    margin-bottom: 1px;
    border-radius: 4px;
    background-color: #1d1d1e;
    border: 1px solid black;
    color: #f0f0f0;

    cursor: pointer;
}

.button:hover, .button:focus {
    background-color: #131314;
}

.button:active {
    background-color: black;
}

.toggle {
    width: 10px;
    height: 10px;
    margin-right: 10px;
}

.label {
    width: 100%;
    text-align: left;
    font-size: 10px;
}

.content {
    display: none;
}

.content.visible {
    display: block;
}

</style>