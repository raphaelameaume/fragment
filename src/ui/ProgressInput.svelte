<div class="progress" bind:this={element} on:mousedown={handleMouseDown}>
    <div class="fill" style="transform: scaleX({map(value, min, max, 0, 1)})"></div>
</div>

<script>
import { map } from "../math/map.js";
import { clamp } from "../math/clamp.js";
import noop from "../utils/noop.js";

// props
export let value;
export let min;
export let max;
export let step;
export let onChange = noop;

let element;

// handlers
function handleMouseDown(event) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    onDrag(event);
}

function handleMouseMove(event) {
    onDrag(event);
}

function onDrag(event) {
    let rect = element.getBoundingClientRect();

    let v = clamp(map(event.clientX, rect.left, rect.right, min, max), min, max);
    v = Math.floor(v * (1 / step)) / (1 / step);

    onChange(v);
}

function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}

</script>

<style>
.progress {
    position: relative;
    
    padding: 0 10px;
    width: 100%;
    height: 20px;
    border-radius: 2px;
    border: 1px solid black;

    background: #1d1d1e;
    cursor: ew-resize;
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