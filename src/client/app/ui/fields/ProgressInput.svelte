<script>
import { createEventDispatcher } from "svelte";
import { map, clamp } from "lemonade-math";

export let value;
export let min;
export let max;
export let step;

let node;
let rect;

const dispatch = createEventDispatcher();

// handlers
function handleMouseDown(event) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    rect = node.getBoundingClientRect();

    onDrag(event);
}

function handleMouseMove(event) {
    onDrag(event);
}

function onDrag(event) {
    let v = clamp(map(event.clientX, rect.left, rect.right, min, max), min, max);
    v = Math.floor(v * (1 / step)) / (1 / step);

    dispatch("change", v);
}

function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}

</script>

<div class="progress" bind:this={node} on:mousedown={handleMouseDown}>
    <div class="fill" style="opacity: {value > 0 ? 1 : 0}; transform: scaleX({map(value, min, max, 0, 1)})"></div>
</div>

<style>
.progress {
    position: relative;
    
    padding: 0 10px;
    width: 100%;
    height: var(--inputHeight);
    border-radius: var(--borderRadius);
    border: var(--borderWidth) solid var(--borderColor);

    background: #1d1d1e;
    cursor: ew-resize;
}

.progress:hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.fill {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: grey;
    transform: scaleX(0.5);
    transform-origin: 0 50%;
    border-radius: 2px;

    background-color: #448eea;
}

</style>
