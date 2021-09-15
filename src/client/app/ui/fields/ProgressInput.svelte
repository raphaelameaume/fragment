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

let isDragging = false;

// handlers
function handleMouseDown(event) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    rect = node.getBoundingClientRect();

    isDragging = true;

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

    isDragging = false;
}

</script>

<div class="progress {isDragging ? "dragging": ""} " bind:this={node} on:mousedown={handleMouseDown}>
    <div class="fill" style="opacity: {value > 0 ? 1 : 0}; transform: scaleX({map(value, min, max, 0, 1)})"></div>
</div>

<style>
.progress {
    position: relative;
    
    height: var(--inputHeight);
    border-radius: var(--borderRadius);
    box-shadow: inset 0 0 0 1px var(--borderColor);

    background: var(--backgroundColor);
    cursor: ew-resize;
    margin-right: var(--padding);
}

.progress:hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.progress.dragging {
    box-shadow: 0 0 0 2px var(--activeColor);
}


.fill {
    position: absolute;
    left: 3px;
    top: 3px;
    bottom: 3px;
    right: 3px;

    background: grey;
    transform-origin: 0 50%;
    border-radius: calc(var(--borderRadius) * 0.5);

    background-color: var(--activeColor);
}

</style>
