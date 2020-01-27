<div class="field">
    <div class="field__trigger">
        {#if isTriggerable}
        <IconTrigger opacity={prop.triggers && prop.triggers.length > 0 ? 0.9 : 0.3}/>
        {/if}
    </div>
    <div class="field__name">{name}</div>
    <div class="field__content {wrap ? 'field__content--wrap' : ''}">
        {#if prop.min !== undefined && prop.max !== undefined} 
            <ProgressInput
                value={prop.value}
                min={prop.min}
                max={prop.max}
                step={step}
                onChange={(value) => prop.value = value}
            />
        {/if}
        {#if type === 'color' } 
            <ColorInput value={prop.value} onChange={(value) => prop.value = value} />
        {/if}
        {#if type === 'boolean' } 
            <Checkbox prop={prop} onChange={(value) => prop.value = value} />
        {/if}
        
        {#if type === 'button'}
            <Button onClick={handleTrigger}>{prop.label ? (typeof prop.label === 'function' ? prop.label(prop) : prop.label) : 'Click' }</Button>
        {/if}
        {#if type === 'select'}
            <Select onChange={(value) => prop.value = value.key} options={prop.options} value={prop.value} />
        {/if}
        {#if type === 'image'}
            <ImageInput
                value={prop.image ? prop.image : prop.value}
                onChange={({ image, name }) => {
                    prop.image = image;
                    prop.value = name;
                }}
            />
        {/if}
        {#if type !== 'button' && type !== 'list' && type !== "select" && type !== 'action-list'}
            <TextInput
                value={type === 'image' ? getFilename(prop.value) : prop.value}
                onSubmit={(value) => prop.value = value}
                disabled={(type === 'boolean' || type === 'image') ? true : disabled}
                step={step}
                type={type}
                min={prop.min}
                max={prop.max}
                style="width: 70px; margin-left: 1px;"
            />
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
                <TextInput width="100%;" style="max-width: 120px;" value={name} disabled={true} />
            </div>
            <div class="field__info">
                <span class="info__name">Type:</span>
                <TextInput width="100%;" style="max-width: 120px;" value={type} disabled={true} />
            </div>
            {#if type !== 'button' }
            <div class="field__info">
                <span class="info__name">Value:</span>
                <TextInput width="100%;" style="max-width: 120px;" value={prop.value} disabled={true} />
            </div>
            {/if}
            {#if typeof prop.min !== 'undefined' }
            <div class="field__info">
                <span class="info__name">Value min:</span>
                <TextInput width="100%;" style="max-width: 120px;" value={prop.min} disabled={true} />
            </div>
            {/if}
            {#if typeof prop.max !== 'undefined' }
            <div class="field__info">
                <span class="info__name">Value max:</span>
                <TextInput width="100%;" style="max-width: 120px;" value={prop.max} disabled={true} />
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
            <div style="display: flex; justify-content: center;">
                <Button style="width: 50%; text-align: center;" onClick={handleClickAddTrigger}>Add</Button>
            </div>
        </Dropdown>
        {/if}
        {#if isStreamable}
        <Dropdown title="Actions">
            <Button onClick={handleClickSetWebcam}>Set webcam feed</Button>
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
import Select from "./Select.svelte";
import TextInput from "./TextInput.svelte";
import ColorInput from "./ColorInput.svelte";
import ProgressInput from "./ProgressInput.svelte";
import ImageInput from "./ImageInput.svelte";
import Checkbox from "./Checkbox.svelte";
import { Keyboard } from "../core/Keyboard.js";
import { Webcam } from "../core/Webcam.js";
import { Storage } from "../core/Storage.js";
import { map } from "../math/map.js";
import { clamp } from "../math/clamp.js";
import IconSettings from "./svg/IconSettings.svelte";
import IconTrigger from "./svg/IconTrigger.svelte";
import loadImage from "../utils/loadImage.js";
import getFilename from "../utils/getFilename.js";
import { Socket } from "../Socket.js";

// props
export let prop;
export let name = '';
export let triggerable = true;
export let disabled = false;
export let output = false;
export let url = '';
export let wrap = false;

// reactive
$: step = prop.step ? prop.step : 0.1;
$: type = prop.type ? prop.type : typeof prop.value;
$: isTriggerable = triggerable && ['boolean', 'number', 'button'].includes(type);
$: isStreamable = type === 'image';
$: checked = prop.value ? true : false;
$: {
    if (typeof prop.onChange === 'function' && prop.value !== undefined) {
        prop.onChange(prop);
    }
}
$: {
    let serialized = {
        value: prop.value,
    };

    if (!output) {
        save(url, serialized);
    }

    if (!output) {
        Socket.emit('PROP_CHANGE', { url, ...serialized });
    }
} 

redhydrate(url);

function redhydrate(key) {
    if (key.length > 0 && Storage.get(key)) {
        let parsed = JSON.parse(Storage.get(key));
    
        prop.initialValue = prop.value;
        prop.value = parsed.value;

        if (prop.value === 'WEBCAM_0') {
            prop.image = Webcam.canvas;
            prop.needsUpdate = true;
        } else {
            prop.needsUpdate = false;
        }
    }
}

function save(key, value) {
    if (key.length > 0) {
        Storage.set(url, JSON.stringify(value));
    }
}

if (output) {
    Socket.on('PROP_CHANGE', (data) => {
        if (data.url === url) {
            prop.value = data.value;
        }
    })
}

let parametersVisible = false;

if (prop.triggers && prop.triggers.length > 0) {
    for (let i = 0; i < prop.triggers.length; i++) {
        prop.triggers[i].onTrigger((params) => {
            if (type === 'boolean') {
                setValue(!prop.value);
            } else if (prop.min !== undefined && prop.max !== undefined && params.value !== undefined) {
                let v = map(params.value, 0, 1, prop.min, prop.max);
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

function handleTrigger(event) {
    if (typeof prop.onTrigger === 'function') {
        prop.onTrigger(prop);
    }
}

function handleClickSettings(event) {
    parametersVisible = true;
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

function handleClickSetWebcam() {
    prop.image = Webcam.canvas;
    prop.value = 'WEBCAM_0';
    prop.needsUpdate = true;
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
    width: 30%;
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

.field__content {
    display: flex;
    padding-top: 5px;
    padding-bottom: 5px;
    width: 100%;
    justify-content: space-between;
}

.field__content--wrap {
    flex-wrap: wrap;
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
</style>