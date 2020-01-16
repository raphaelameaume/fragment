<div class="field">
    <div class="field__trigger">
        {#if isTriggerable}
        <IconTrigger opacity={prop.triggers && prop.triggers.length > 0 ? 0.9 : 0.3}/>
        {/if}
    </div>
    <div class="field__name">{name}</div>

    <div class="field__content">
    
    {#if prop.min !== undefined && prop.max !== undefined} 
    <div class="field__progress" bind:this={progress} on:mousedown={handleMouseDown}>
        <div class="progress__fill" style="transform: scaleX({map(prop.value, prop.min, prop.max, 0, 1)})"></div>
    </div>
    {/if}

    {#if type === 'color' } 
    <div class="field__color" style="background-color: {prop.value}">
        <input type="color" class="color__input" value={prop.value} on:change={handleChangeColor} />
    </div>
    {/if}

    {#if type === 'boolean' } 
        <Checkbox prop={prop} onChange={(value) => prop.value = value} />
        <TextInput style="width: 70px; margin-left: 1px;" prop={prop} disabled={true} />
    {/if}

    {#if type !== 'boolean' && type !== 'button' && type !== 'image' && type !== 'list' && type !== "select" && type !== 'action-list'}
        <input type="text" class="field__value field__value--text" value={prop.value} bind:this={inputs.text} on:keyup={handleKeyUp} on:focus={handleFocus} on:blur={handleBlur} disabled={disabled}/>
    {/if}

    {#if type === 'button'}
        <button class="field__value field__value--button" on:click={handleTrigger}>{prop.label ? prop.label : 'Click' }</button>
    {/if}

    {#if type === 'image'}
        <div class="field__image" style="{prop.image ? `background-image: url(${prop.image.src})`: ''}" on:click={handleClickImage}>
            <input type="file" style="display: none" on:change={handleUploadImage} bind:this={inputs.upload}/>
        </div>
        <TextInput width="70px" prop={{value:getFilename(prop.value)}} disabled={true} />
    {/if}

    {#if type === 'select'}
        <Select onChange={handleChangeSelect} options={prop.value}/>
    {/if}

    {#if type === 'list' || type === 'action-list'}
        <div class="field__value field__value--list {disabled ? 'field__value--disabled' : ''}">
            {#each prop.value as option}
                {#if type === 'action-list'}
                <button class="field__value--listitem" on:click={() => prop.onTrigger(option)}>{option.value}</button>
                {/if}
                {#if type === 'list'}
                <span class="field__value--listitem">{option.value}</span>
                {/if}
            {/each}
        </div>
    {/if}
    <slot></slot>
    </div>
    <button class="field__settings" on:click={handleClickSettings}>
        <IconSettings/>
    </button>
    {#if parametersVisible}
    <Window title={name} visible={parametersVisible} onClose={(visibility) => parametersVisible = visibility}>
        <Dropdown title="Informations">
            <div class="field__info">
                <span class="info__name">Name:</span>
                <TextInput width="100%;" style="max-width: 120px;" prop={{ value: name}} disabled={true} />
            </div>
            <div class="field__info">
                <span class="info__name">Type:</span>
                <TextInput width="100%;" style="max-width: 120px;" prop={{ value: type}} disabled={true} />
            </div>
            {#if type !== 'button' }
            <div class="field__info">
                <span class="info__name">Value:</span>
                <TextInput width="100%;" style="max-width: 120px;" prop={{ value: prop.value}} disabled={true} />
            </div>
            {/if}
            {#if typeof prop.min !== 'undefined' }
            <div class="field__info">
                <span class="info__name">Value min:</span>
                <TextInput width="100%;" style="max-width: 120px;" prop={{ value: prop.min}} disabled={true} />
            </div>
            {/if}
            {#if typeof prop.max !== 'undefined' }
            <div class="field__info">
                <span class="info__name">Value max:</span>
                <TextInput width="100%;" style="max-width: 120px;" prop={{ value: prop.max}} disabled={true} />
            </div>
            {/if}
        </Dropdown>
        {#if isTriggerable }
        <Dropdown title="Triggers">
            {#if (prop.triggers && prop.triggers.length > 0)}
                {#each prop.triggers as trigger}
                <Trigger trigger={trigger} />
                {/each }
            {/if}
            <Button style="width: 50%" onClick={handleClickAddTrigger}>Add</Button>
        </Dropdown>
        {/if}
    </Window>
    {/if}
</div>

<script>
import Window from "./Window.svelte";
import Trigger from "./Trigger.svelte";
import Dropdown from "./Dropdown.svelte";
import Button from "./Button.svelte";
import { map } from "../math/map.js";
import { clamp } from "../math/clamp.js";
import Select from "./Select.svelte";
import TextInput from "./TextInput.svelte";
import Checkbox from "./Checkbox.svelte";
import { Keyboard } from "../core/Keyboard.js";
import { Storage } from "../core/Storage.js";
import IconSettings from "./svg/IconSettings.svelte";
import IconTrigger from "./svg/IconTrigger.svelte";
import { Socket } from "../Socket.js";

export let prop;
export let name = '';
export let triggerable = true;
export let disabled = false;
export let output;
export let onSubmit = () => {};
export let url = '';



if (url.length > 0 && Storage.get(url)) {
    let parsed = JSON.parse(Storage.get(url));

    prop.initialValue = prop.value;
    prop.value = parsed.value;

    if (prop.onChange) {
        prop.onChange(prop);
    }
}

$: {
    let serialized = {
        value: prop.value,
    };

    if (url.length > 0 && !output) {
        Storage.set(url, JSON.stringify(serialized));
    }

    if (!output) {
        Socket.emit('PROP_CHANGE', { url, ...serialized });
    }
} 

if (output) {
    Socket.on('PROP_CHANGE', (data) => {
        console.log('receive prop change');

        if (data.url === url) {
            prop.value = data.value;
            
            if (prop.onChange) {
                prop.onChange(prop);
            }
        }
    })
}

let inputs = {
    text: null,
    image: null,
    upload: null,
};

let progress, fill;

let parametersVisible = false;

$: {
    //@TODO should be here
    if (prop.triggers && prop.triggers.length > 0) {
        for (let i = 0; i < prop.triggers.length; i++) {
            prop.triggers[i].onTrigger((params) => {
                if (type === 'boolean') {
                    setValue(!prop.value);
                } else if (prop.min !== undefined && prop.max !== undefined && params.value !== undefined) {
                    let v = map(params.value, 0, 1, prop.min, prop.max);
                    console.log('remap trigger', v);
                    setValue(v);

                    if (prop.onTrigger) {
                        prop.onTrigger(params);
                    }
                } else if (prop.onTrigger) {
                    prop.onTrigger();
                }
            });
        }
    }
}
$: {
    if (prop.type === 'image') {
        if (prop.image && prop.onChange) {
            prop.onChange(prop);
        } else {
            loadImage(prop.value);
        }
    }
}

$: step = prop.step ? prop.step : 0.1;
$: type = prop.type ? prop.type : typeof prop.value;
$: isTriggerable = triggerable && ['boolean', 'number', 'button'].includes(type);
$: checked = prop.value ? true : false;

async function loadImage(src) {
    let response = await fetch(src);
    let blob = await response.blob();
    let dataURL = URL.createObjectURL(blob);

    let image = new Image();
    image.addEventListener('load', () => {
        prop.image = image;
        
        if (prop.onChange) {
            prop.onChange(prop);
        }
    });
    image.src = dataURL;
}



function getFilename(filepath) {
    let parts = filepath.split('/');

    return parts[parts.length - 1];
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

function handleClickImage() {
    inputs.upload.click();
}

function handleUploadImage(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        prop.value = file.name;
        loadImage(e.target.result);
    };

    console.log({ file });
	reader.readAsDataURL(file);
}

function handleKeypressWindow(event) {
    if (event.keyCode === 13) {
        inputs.text.blur();
        setValue(inputs.text.value);

        onSubmit(prop.value);
    }
}

function handleKeydownWindow(event) {
    if (event.keyCode === 38) { // ArrowUp
        if (type === 'number') {
            event.preventDefault();

            setValue(prop.value + step);
        }
    }

    if (event.keyCode === 40) { // ArrowDown
        if (type === 'number') {
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

function handleClickAddTrigger() {
    prop.triggers = [
        ...prop.triggers,
        Keyboard.key(''),
    ];
}

</script>

<style>
.field {
    position: relative;

    display: flex;
    width: 100%;
    padding-right: 20px;
}

.field__trigger {
    position: relative;

    width: 20px;
    flex-shrink: 0;
    flex-grow: 0;
    padding: 0 4px;
    margin-left: 5px;
}

.field__name {
    display: flex;
    width: 40%;
    height: 30px;
    padding: 0 10px;
    align-items: center;
    flex-shrink: 0;
    flex-grow: 0;
}

.field__value {
    /* width: 22%; */
    width: 70px;
    height: 100%;
    padding: 0 10px;
    flex-shrink: 0;
    flex-grow: 0;
}

.field__value--list {
    flex-direction: column;
    display: flex;
    width: 60%;
    height: 60px;
    padding: 2px 5px;

    font-size: 10px;

    border: 1px solid black;
    border-radius: 2px;
    background: #1d1d1e;
    overflow-y: scroll;
    overflow-x: hidden;
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

.field__value--disabled .field__value--listitem {
    color: rgba(240, 240, 240, 0.3);
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

.field__value--text:disabled {
    color: rgba(240, 240, 240, 0.3);
}

.field__content {
    display: flex;
    padding-top: 5px;
    padding-bottom: 5px;
    width: 100%;
    justify-content: space-between;
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
    height: 20px;
    padding: 0;
    margin: 0;

    border: none;
    background-color: transparent;
    border-radius: 0;
    outline: 0;
    border-radius: 2px;
    border: 1px solid black;
}

.color__input {
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
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
    width: 70px;
    height: 70px;
    margin: 0 1px 0 0;

    background-position: center;
    background-size: 100%;
    background-repeat: no-repeat;
    border-radius: 2px;
    background-color: #1d1d1e;
    border: 1px solid black;

    cursor: pointer;
}

.field__settings {
    position: absolute;
    top: 5px;
    right: 1px;

    display: flex;
    justify-content: center;
    align-items: center;
    width: 18px;
    height: 20px;

    background-color: transparent;
    border: 0;
    cursor: pointer;
}

.field__info {
    display: flex;
    width: 100%;
    justify-content: space-between;
    height: 30px;
    margin-top: 1px;
    padding: 0 10px;
    align-items: center;
}

.info__name {
}

</style>