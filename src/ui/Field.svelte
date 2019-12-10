<div class="field">
    <div class="field__name">{name}</div>
    <div class="field__progress" bind:this={progress} on:mousedown={handleMouseDown}>
        <div class="progress__fill" style="transform: scaleX({map(prop.value, prop.min, prop.max, 0, 1)})"></div>
    </div>
    <div class="field__value">{prop.value}</div>
</div>

<style>
.field {
    align-items: center;

    display: flex;
    width: 100%;
    height: 30px;
}
.field__name {
    width: 40%;
    padding: 0 10px;
    flex-shrink: 0;
    flex-grow: 0;
}

.field__value {
    width: 22%;
    flex-shrink: 0;
    flex-grow: 0;
    padding: 0 10px;
}

.field__progress {
    position: relative;
    
    padding: 0 10px;
    width: 100%;
    height: 100%;

    background: lightgray;
    cursor: ew-resize;
}

.progress__fill {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: grey;
    transform: scaleX(0.5);
    transform-origin: 0 50%;
    
}

</style>

<script>
import { map } from "../math/map.js";
import { clamp } from "../math/clamp.js";

export let prop;
export let name = '';
export let step = 0.1;

let progress, fill;

function handleMouseDown(event) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    onDrag(event);
}

function handleMouseMove(event) {
    onDrag(event);
}

function onDrag(event) {
    let rect = progress.getBoundingClientRect();
    
    setValue(map(event.clientX, rect.left, rect.right, prop.min, prop.max));
}

function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}

function setValue(v) {
    prop.value = Math.floor(clamp(v, prop.min, prop.max) * (1 / step)) / (1 / step);

    // fill.style.transform = `scaleX(${p})`;
}

</script>