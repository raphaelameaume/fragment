<div class="field">
    <div class="field__live"></div>
    <div class="field__name">{name}</div>
    {#if prop.min !== undefined && prop.max !== undefined} 
    <div class="field__progress" bind:this={progress} on:mousedown={handleMouseDown}>
        <div class="progress__fill" style="transform: scaleX({map(prop.value, prop.min, prop.max, 0, 1)})"></div>
    </div>
    {/if}

    {#if type === 'color' } 
    <input type="color" class="field__color" value={prop.value} on:change={handleChangeColor} />
    {/if}

    {#if type === 'boolean' } 
    <div class="field__check">
        <input type="checkbox" class="check__input" bind:checked={prop.value} />
    </div>
    {/if}

    {#if type !== 'boolean' && type !== 'button' && type !== 'image' && type !== 'list' && type !== "select"}
        <input type="text" class="field__value field__value--text" value={prop.value} bind:this={inputs.text} on:keyup={handleKeyUp} on:focus={handleFocus} on:blur={handleBlur}/>
    {/if}

    {#if type === 'button'}
        <button class="field__value field__value--button" on:click={handleTrigger}>{prop.label ? prop.label : 'Click' }</button>
    {/if}

    {#if type === 'image'}
        <div class="field__image"></div>
    {/if}

    {#if type === 'select'}
        <Select onChange={handleChangeSelect} options={prop.value}/>
    {/if}

    {#if type === 'list'}
        <div class="field__value field__value--list">
            {#each prop.value as option}
            <button class="field__value--listitem" on:click={() => prop.onTrigger(option)}>{option.value}</button>
            {/each}
        </div>
    {/if}
    <slot></slot>
    <button class="field__settings" on:click={handleClickSettings}>
        <IconSettings/>
    </button>
    {#if parametersVisible}
    <Window title="Parameters" visible={parametersVisible} onClose={(visibility) => parametersVisible = visibility}>
        <Dropdown title="Informations">
        </Dropdown>
        <Dropdown title="Triggers">
            {#if (prop.triggers && prop.triggers.length > 0)}
                {#each prop.triggers as trigger}
                <Trigger trigger={trigger} />
                {/each }
            {/if}
            <Button style="width: 50%">Add</Button>
        </Dropdown>
    </Window>
    {/if}
</div>

<style>
.field {
    position: relative;

    align-items: center;

    display: flex;
    width: 100%;
    height: 30px;
    padding-right: 20px;
}

.field__live {
    position: relative;

    width: 20px;
    flex-shrink: 0;
    flex-grow: 0;
}

.field__live:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;

    width: 10px;
    height: 10px;
    margin-left: -5px;
    margin-top: -5px;

    border-radius: 5px;
    background-color: #aa1e29;
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

.field__value--list {
    display: flex;
    flex-direction: column;

    overflow-y: scroll;
    overflow-x: hidden;

    font-size: 10px;
    height: 40px;
    padding: 0;
    border-radius: 2px;
    background: #1d1d1e;
    border: 1px solid black;
    padding: 2px 5px;
}

.field__value--list::-webkit-scrollbar {
    height: 100%;
    width: 7px;
    background: #000;
}

.field__value--list::-webkit-scrollbar-thumb {
    height: 4px;
    background: #448eea;
    border-radius: 5px;
}

.field__value--listitem {
    margin: 0;
    padding: 0;
    height: auto;
    background-color: transparent;
    border-bottom: #131314;
    border: none;
    color: #f0f0f0;
    text-align: left;
    white-space: nowrap;
}

.field__value--button {
    border-radius: 2px;
    background: #1d1d1e;
    border: 1px solid black;
    color: #f0f0f0;
    font-size: 10px;
    height: 20px;
    cursor: pointer;
}

.field__value--button:hover, .field__value--button:focus {
    background: #131314;
}

.field__value--button:active {
    background-color: #448eea;
}

.field__value--text {
    background: #1d1d1e;
    border: 1px solid black;
    font-size: 10px;
    height: 20px;
    color: #f0f0f0;
    outline: 0;
    margin: 0 0 0 1px;
}

.field__value--text:focus {
    border: 1px solid #448eea;
}


.field__progress {
    position: relative;
    
    padding: 0 10px;
    width: 100%;
    height: 20px;
    border-radius: 2px;
    border: 1px solid black;

    background: #1d1d1e;
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
    border-radius: 2px;

    background-color: #448eea;
}

.field__image {
    width: 30px;
    height: 30px;
    border: 6px solid white;
    box-sizing: border-box;
}

.field__settings {
    position: absolute;
    top: 0;
    right: 1px;

    display: flex;
    justify-content: center;
    align-items: center;
    width: 18px;
    height: 100%;

    background-color: transparent;
    border: 0;
}

</style>

<script>
import Window from "./Window.svelte";
import Trigger from "./Trigger.svelte";
import Dropdown from "./Dropdown.svelte";
import Button from "./Button.svelte";
import { map } from "../math/map.js";
import { clamp } from "../math/clamp.js";
import Select from "./Select.svelte";
import IconSettings from "./svg/IconSettings.svelte";

export let prop;
export let name = '';
export let type = prop.type ? prop.type : typeof prop.value;

let inputs = {
    text: null,
};

let step = prop.step ? prop.step : 0.01;
let progress, fill;
let parametersVisible = false;

$: checked = prop.value ? true: false;

//@TODO should be here
if (prop.triggers && prop.triggers.length > 0) {
    for (let i = 0; i < prop.triggers.length; i++) {
        prop.triggers[i].onTrigger(() => {
            prop.onTrigger();
        });
    }
}

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

function handleChangeSelect(activeValue, event) {
    if (prop.onChange) {
        prop.onChange(activeValue, event);
    }
}

function handleTrigger(event) {
    if (typeof prop.onTrigger === 'function') {
        prop.onTrigger(prop);
    }
}

function handleClickSettings(event) {
    console.log('settings clicked');
    parametersVisible = true;
}

function handleFocus(event) {
    window.addEventListener('keypress', handleKeypressWindow);
    window.addEventListener('keydown', handleKeydownWindow);
}

function handleBlur() {
    window.removeEventListener('keypress', handleKeypressWindow);
    window.removeEventListener('keydown', handleKeydownWindow);
}

function handleKeypressWindow(event) {
    if (event.keyCode === 13) {
        inputs.text.blur();
        setValue(inputs.text.value);
    }
}

function handleKeydownWindow(event) {
    if (event.keyCode === 38) { // ArrowUp
        if (prop.type === 'number') {
            event.preventDefault();

            setValue(prop.value + step);
        }
    }

    if (event.keyCode === 40) { // ArrowDown
        if (prop.type === 'number') {
            event.preventDefault();

            setValue(prop.value - step);
        }
    }
}

function setValue(v) {
    if (prop.min !== undefined && prop.max !== undefined) {
        prop.value = Math.floor(clamp(v, prop.min, prop.max) * (1 / step)) / (1 / step);
    } else {
        prop.value = v;
    }

    if (typeof prop.onChange === 'function') {
        prop.onChange(prop);
    }
}

</script>