<div class="field">
    <div class="field__name">{name}</div>
    {#if prop.min !== undefined && prop.max !== undefined} 
    <div class="field__progress" bind:this={progress} on:mousedown={handleMouseDown}>
        <div class="progress__fill" style="transform: scaleX({map(prop.value, prop.min, prop.max, 0, 1)})"></div>
    </div>
    {/if}

    {#if type === 'color' } 
    <input type="color" class="field__color" value="{prop.value}" on:change={handleChangeColor} />
    {/if}

    {#if type === 'boolean' } 
    <div class="field__check">
        <input type="checkbox" class="check__input" value="{value}" on:change={handleChangeCheck} />
    </div>
    {/if}

    {#if type !== 'boolean'}
        <input type="text" class="field__value" value="{prop.value}" on:keyup={handleKeyUp}/>
    {/if}
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
    height: 100%;
    padding: 0 10px;
    flex-shrink: 0;
    flex-grow: 0;
}

.field__progress {
    position: relative;
    
    padding: 0 10px;
    width: 100%;
    height: 100%;

    background: lightgray;
    cursor: ew-resize;
}

.field__color {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;

    border: none;
    background-color: transparent;
    border-radius: 0;
    outline: 0;
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
export let type = prop.type ? prop.type : typeof prop.value;

let value = prop.value;
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

function handleKeyUp(event) {
    if (event.keyCode === 13) {
        setValue(event.currentTarget.value);
    }
}

function handleChangeColor(event) {
    setValue(event.currentTarget.value);
}

function handleChangeCheck(event) {
    setValue(event.target.checked);
}

function setValue(v) {
    if (prop.min !== undefined && prop.max !== undefined) {
        prop.value = Math.floor(clamp(v, prop.min, prop.max) * (1 / step)) / (1 / step);
    } else {
        prop.value = v;
    }

    // console.log(`Field :: setValue`, prop.value);

    value = prop.value;

    if (typeof prop.onChange === 'function') {
        prop.onChange(prop);
    }
}

</script>