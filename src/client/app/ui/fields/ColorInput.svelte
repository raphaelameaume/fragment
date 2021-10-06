<script>
import { createEventDispatcher } from "svelte";
import { colord } from "colord"; 
import TextInput from "./TextInput.svelte";
import Field from "../Field.svelte";

export let value;
export let name;

const dispatch = createEventDispatcher();

let color = colord(value);
let hasAlpha = false;
let alpha = 0;

if (value.includes("rgba")) {
    hasAlpha = true;
    alpha = color.alpha();
}

$: textValue = hasAlpha ? colord(`rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`).toHex() : color.toHex();
$: inputValue = colord(textValue).toHex();

function handleChangeColor(event) {
    textValue = event.currentTarget.value;
    inputValue = event.currentTarget.value;

    dispatch('change', event.currentTarget.value);
}

function onChangeText(event) {
    textValue = event.currentTarget.value;

    dispatch('change', event.currentTarget.value);
}

</script>

<div class="color-input">
    <div class="layout">
        <div class="mirror" style="--currentColor: {textValue}">
            <!-- svelte-ignore -->
            <input class="input" type="color" value={inputValue} {name} on:input={handleChangeColor} />
        </div>
        <TextInput value={textValue} on:input={onChangeText} {name} on:change={onChangeText} />
    </div>
    {#if hasAlpha }
        <Field key="alpha" value={alpha} params={{min: 0, max: 1, step: 0.01}}></Field>
    {/if }
</div>

<style>
.color-input {
    position: relative;
    width: 100%;
}

.layout {
    display: grid;
    column-gap: var(--columnGap);
    grid-template-columns: 0.35fr 0.65fr;
    align-items: center;
}

.mirror {
    position: relative;
    
    height: var(--inputHeight);

    border-radius: var(--inputBorderRadius);
    box-shadow: inset 0 0 0 1px var(--inputBorderColor);
}

.mirror:before {
    --gap: 1px;

    content: '';
    position: absolute;
    top: var(--gap);
    left: var(--gap);
    right: var(--gap);
    bottom: var(--gap);

    background-color: var(--currentColor);
    border-radius: calc(var(--inputBorderRadius) * 0.5);
}

.mirror:hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.input {
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    background: transparent;
    border: none;
}

</style>
