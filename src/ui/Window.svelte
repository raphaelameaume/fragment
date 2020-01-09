<div class="window" bind:this={container} style="transform: translate3d({offsetX}px, {offsetY}px, 0); display: {display}">
    <header class="header" on:mousedown={handleMouseDownHeader}>
        <button class="close" on:click={handleClickClose}>
        </button>
        <h1 class="title">{title}</h1>
    </header>
    <div class="content">
        <slot></slot>
    </div>
</div>

<style>
.window {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 999;

    width: 250px;
    height: 400px;
    margin-left: -125px;
    margin-top: -200px;

    background-color: #242425;
    border: 1px solid black;
}

.close {
    display: flex;
    align-items: center;
    width: 15px;
    height: 15px;
    margin: 4px;

    background-color: #f84545;
    border-radius: 50%;
    border: none;
}

.header {
    display: flex;
    align-items: center;

    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    margin-bottom: 1px;
}

.title {
    font-size: 12px;
}
</style>

<script>
import { onMount } from 'svelte';
import IconClose from "./svg/IconClose.svelte";

export let visible = true;
export let title = '';
export let onClose = () => {};

let container;
let offsetX = 0;
let offsetY = 0;
let startX = 0;
let startY = 0;
$: display = visible ? 'block' : 'none';

onMount(() => {
    document.body.appendChild(container);
})

function handleClickClose() {
    visible = false;

    onClose(visible);
}

function handleMouseDownHeader(event) {
    startX = event.clientX - offsetX;
    startY = event.clientY - offsetY;

    document.addEventListener('mousemove', handleMouseMoveDocument);
    document.addEventListener('mouseup', handleMouseUpDocument);
}

function handleMouseMoveDocument(event) {
    offsetX = event.clientX - startX;
    offsetY = event.clientY - startY;
}

function handleMouseUpDocument() {
    document.removeEventListener('mousemove', handleMouseMoveDocument);
    document.removeEventListener('mouseup', handleMouseUpDocument);
}

</script>
