<script>
import { createEventDispatcher } from "svelte";
import { colorToHex, colorToRGBA, colorToRGBAString, colorToRGBString, colorToVec3String, colorToVec4String, componentsToVec4String, FORMATS, getColorFormat, hexToRGBA, hexToVec3String, hexToVec4String, isColor,  isRGBAString,  isVec4String,  RGBAToRGBAString, stringToRGBA } from "../../utils/color.utils.js";
import TextInput from "./TextInput.svelte";
import Field from "../Field.svelte";

export let value;
export let name;

const dispatch = createEventDispatcher();

let hexValue = colorToHex(value);
let isInputDriven = true;

let override = false;

let format = getColorFormat(value);
let textValue = formatColorFromHex(hexValue);
let alpha = 1;

$: hasAlpha = typeof textValue === "string" && (isRGBAString(textValue) || isVec4String(textValue));
$: {
    if (isInputDriven) {
        textValue = formatColorFromHex(hexValue);
    } else {
        hexValue = colorToHex(textValue);
    }
}

$: {
    if (hasAlpha) {
        const [r, g, b, a = 1] = colorToRGBA(textValue);
        alpha = a;
    }
}

function handleBlur() {
    dispatch('change', textValue);
}

function formatColorFromHex(hex) {
    if (override) return textValue;

    if (format === FORMATS.HEX_STRING) return hex;
    if (format === FORMATS.VEC3_STRING) return hexToVec3String(hex);
    if (format === FORMATS.RGB_STRING) return hexToRGBString(hex);

    let components = hexToRGBA(hex);

    if (hasAlpha && alpha !== 1) {
        components[3] = alpha;
    }

    if (format === FORMATS.RGBA_STRING) return RGBToRGBAString(components);
    if (format === FORMATS.VEC4_STRING) return componentsToVec4String(components);
}

function onChangeText(event) {
    isInputDriven = false;

    const { value } = event.currentTarget;

    if (isColor(value)) {
        format = getColorFormat(value);
        textValue = value;

        dispatch('change', value);
    }
}

function onChangeAlpha(event) {
    if (format === FORMATS.RGBA_STRING) {
        const [r, g, b] = hexToRGBA(textValue);

        textValue = RGBAToRGBAString([r, g, b, event.detail]);
    } else if (format === FORMATS.VEC4_STRING) {
        const [r, g, b] = hexToRGBA(hexValue);

        textValue = componentsToVec4String([r, g, b, event.detail]);
    }
}



</script>

<div class="color-input">
    <div class="layout">
        <div class="mirror" style="--currentColor: {hexValue}; --opacity: {alpha}">
            <!-- svelte-ignore -->
            <input class="input" type="color" bind:value={hexValue} {name} on:blur={handleBlur} on:input={() => isInputDriven = true} />
        </div>
        <TextInput value={textValue} on:input={onChangeText} {name} on:change={onChangeText} />
    </div>
    {#if hasAlpha }
        <Field key="alpha" value={alpha} params={{min: 0, max: 1, step: 0.01}} on:change={onChangeAlpha}></Field>
    {/if }
</div>

<style>
.color-input {
    position: relative;
    width: 100%;
}

.layout {
    display: grid;
    column-gap: var(--column-gap);
    grid-template-columns: 0.35fr 0.65fr;
    align-items: center;
}

.mirror {
    position: relative;
    
    height: var(--height-input);

    border-radius: var(--border-radius-input);
    box-shadow: inset 0 0 0 1px var(--color-border-input);
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
    border-radius: calc(var(--border-radius-input) * 0.5);
    opacity: var(--opacity, 1);
}

.mirror:hover {
    box-shadow: inset 0 0 0 1px var(--box-shadow-color, var(--color-active));
}

.mirror:focus-within {
    box-shadow: 0 0 0 2px var(--box-shadow-color, var(--color-active));
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
