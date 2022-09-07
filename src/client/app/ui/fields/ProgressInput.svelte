<script>
import { createEventDispatcher } from "svelte";
import { map, clamp } from "../../utils/math.utils.js";

export let value;
export let min;
export let max;
export let step;
export let context = null;
export let key = "";

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

$: scaleX = clamp(map(value, min, max, 0, 1), 0, 1);

</script>

<div class="progress {isDragging ? "dragging": ""} " bind:this={node} on:mousedown={handleMouseDown}>
    <div class="fill" style="opacity: {scaleX > 0 ? 1 : 0}; transform: scaleX({scaleX})"></div>
</div>

<style>
.progress {
    position: relative;
    
    height: var(--height-input);
    border-radius: var(--border-radius-input);
    box-shadow: inset 0 0 0 1px var(--color-border-input);

    background: var(--color-background-input);
    cursor: ew-resize;
}

.progress:hover {
    box-shadow: inset 0 0 0 1px var(--color-active);
}

.progress.dragging {
    box-shadow: 0 0 0 2px var(--color-active);
}


.fill {
    position: absolute;
    left: 3px;
    top: 3px;
    bottom: 3px;
    right: 3px;

    background: grey;
    transform-origin: 0 50%;
    border-radius: calc(var(--border-radius-input) * 0.5);

    background-color: var(--color-active);
}

</style>
