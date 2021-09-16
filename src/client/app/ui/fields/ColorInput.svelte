<script>
import { colord } from "colord"; 
import TextInput from "./TextInput.svelte";
import Field from "../Field.svelte";

export let value;

let color = colord(value);
let hasAlpha = false;
let alpha = 0;

if (color.toRgbString().includes("rgba")) {
    hasAlpha = true;
    alpha = color.alpha();
}

$: textValue = hasAlpha ? colord(`rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`).toHex() : color.toHex();
$: inputValue = colord(textValue).toHex();

function handleChangeColor() {

}

function onChangeText(event) {
    textValue = event.currentTarget.value;
}

</script>

<div class="color-input">
    <div class="layout">
        <div class="mirror" style="--backgroundColor: {textValue}">
            <!-- svelte-ignore -->
            <input class="input" type="color" value={inputValue} on:change={handleChangeColor} />
        </div>
        <TextInput value={textValue} on:input={onChangeText} on:change={onChangeText} />
    </div>
    {#if hasAlpha }
        <Field name="alpha" value={alpha} params={{min: 0, max: 1, step: 0.01}}></Field>
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

    border-radius: var(--borderRadius);
    box-shadow: inset 0 0 0 1px var(--borderColor);
}

.mirror:before {
    --gap: 1px;

    content: '';
    position: absolute;
    top: var(--gap);
    left: var(--gap);
    right: var(--gap);
    bottom: var(--gap);

    background-color: var(--backgroundColor);
    border-radius: calc(var(--borderRadius) * 0.5);
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