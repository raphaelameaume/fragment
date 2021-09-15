<script>
import { colord } from "colord";

import Select from "./fields/Select.svelte";
import NumberInput from "./fields/NumberInput.svelte";
import CheckboxInput from "./fields/CheckboxInput.svelte";
import Vec2Input from "./fields/Vec2Input.svelte";
import Vec3Input from "./fields/Vec3Input.svelte";
import TextInput from "./fields/TextInput.svelte";
import ColorInput from "./fields/ColorInput.svelte";

export let value;
export let name;
export let params = {};

const fields = {
    "select": Select,
    "number": NumberInput,
    "vec2": Vec2Input,
    "vec3": Vec3Input,
    "checkbox": CheckboxInput,
    "text": TextInput,
    "color": ColorInput
};

function inferFromParams() {
    if (params.options && Array.isArray(params.options)) {
        return "select";
    }

    return null;
}

function inferFromValue() {
    if (typeof value === "number") {
        return "number";
    } else if (typeof value === "boolean") {
        return "checkbox";
    } else if (typeof value === "string") {
        if (colord(value).parsed) return "color";

        return "text";
    } else if (Array.isArray(value) && value.length === 2) {
        return "vec2";
    } else if (Array.isArray(value) && value.length === 3) {
        return "vec3";
    } else if (typeof value === "object" && Object.keys(value).length === 3) {
        return "vec3";
    } else if (typeof value === "object" && Object.keys(value).length === 2) {
        return "vec2";
    }
}

let type = inferFromParams() || inferFromValue();
let input = fields[type];

</script>

<div class="field">
    <div class="field__infos">
        <label class="field__label" for={name}>{name}</label>
    </div>
    <div class="field__input">
        <svelte:component this={input} value={value} {...params} on:change />
    </div>
</div>

<style>
.field {
    display: grid;
    grid-template-columns: 0.5fr 1fr;
    column-gap: 20px;
    width: 100%;
    margin: 6px 0;

    --columnGap: 3px;
    --inputHeight: 20px;
    --padding: 6px;
    --activeColor: #177bd0;
    --borderRadius: 3px;
    --borderWidth: 1px;
    --borderColor: #000000;
    --backgroundColor: #1d1d1e;
    --fontSize: 11px;
    --fontFamily: "Jetbrains Mono";
    --color: #f0f0f0;
}

:global(.field__input .field:last-child) {
    margin-bottom: 0;
}

.field__infos {
    display: flex;
    align-items: center;
    padding-left: calc(var(--padding) * 2);
}

.field__label {
    color: #f0f0f0;
    font-size: var(--fontSize);
    font-family: var(--fontFamily);
    user-select: none;

    opacity: 0.5;
    transition: opacity 0.1s ease; 
}

.field:hover .field__label, .field:focus-within .field__label {
    opacity: 1;
}

.field__input {
}
</style>
