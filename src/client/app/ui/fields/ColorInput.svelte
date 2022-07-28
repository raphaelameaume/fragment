<script>
import { createEventDispatcher } from "svelte";
import * as color from "../../utils/color.utils.js";
import TextInput from "./TextInput.svelte";
import Field from "../Field.svelte";

export let value;
export let name;

const dispatch = createEventDispatcher();

let hexValue = color.toHex(color.isTHREE(value) ? `#${value.getHexString()}` : value);
let isInputDriven = true;

let override = false;

let format = color.getColorFormat(value);
let textValue = formatColorFromHex(hexValue);
let alpha = 1;

$: hasAlpha = typeof textValue === "string" &&
    (
        color.isRGBAString(textValue) ||
        color.isVec4String(textValue) ||
        color.isHSLAString(textValue)
    );
$: {
    if (isInputDriven) {
        textValue = formatColorFromHex(hexValue);
    } else {
        hexValue = color.toHex(textValue);
    }

    if (color.isTHREE(value)) {
        const [r, g, b] = color.hexToComponents(hexValue);

        value.r =  r / 255;
        value.g =  g / 255;
        value.b =  b / 255;
    }
}

$: {
    if (hasAlpha) {
        const [r, g, b, a = 1] = color.toComponents(textValue);
        alpha = a;
    }
}

function dispatchChange() {
    // support THREE.Color
    if (color.isTHREE(value)) {
        dispatch('change', value);
    } else {
        dispatch('change', textValue);
    }
}

function handleBlur() {
    dispatchChange();
}

function formatColorFromHex(hex) {
    if (override) return textValue;

    if (format === color.FORMATS.THREE) return color.threeToHexString(value);
    if (format === color.FORMATS.HEX_STRING) return hex;
    if (format === color.FORMATS.VEC3_STRING) return color.hexToVec3String(hex);
    if (format === color.FORMATS.RGB_STRING) return color.hexToRGBString(hex);

    let components = color.hexToComponents(hex);

    if (hasAlpha && alpha !== 1) {
        components[3] = alpha;
    }

    if (format === color.FORMATS.HSL_STRING) return color.hexToHSLString(components);
    if (format === color.FORMATS.RGBA_STRING) return color.componentsToRGBAString(components);
    if (format === color.FORMATS.VEC4_STRING) return color.componentsToVec4String(components);
    if (format === color.FORMATS.HSLA_STRING) return color.componentsToHSLAString(components);
    
}

function onChangeText(event) {
    isInputDriven = false;

    const { value } = event.currentTarget;

    if (color.isColor(value)) {
        format = color.getColorFormat(value);
        textValue = value;

        dispatch('change', value);
    }
}

function onChangeAlpha(event) {
    isInputDriven = false;

    if (format === color.FORMATS.RGBA_STRING) {
        const [r, g, b] = color.hexToComponents(hexValue);

        textValue = color.componentsToRGBAString([r, g, b, event.detail]);
    } else if (format === color.FORMATS.VEC4_STRING) {
        const [r, g, b] = color.vecToComponents(textValue);

        textValue = color.componentsToVec4String([r, g, b, event.detail]);
    } else if (format === color.FORMATS.HSLA_STRING) {
        const [h, s, l] = color.hslToHSLComponents(textValue);

        textValue = color.hslaToHSLAString([h, s, l, event.detail]);
    }
}

function onInput() {
    isInputDriven = true;

    dispatchChange();
}

</script>

<div class="color-input">
    <div class="layout">
        <div class="mirror" style="--currentColor: {hexValue}; --opacity: {alpha}">
            <!-- svelte-ignore -->
            <input class="input" type="color" bind:value={hexValue} {name} on:blur={handleBlur} on:input={onInput} />
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
