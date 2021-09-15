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

$: textValue = color.toHex();
$: inputValue = colord(textValue).toHex();

function handleChangeColor() {

}

function onChangeText(event) {
    textValue = event.currentTarget.value;
}


</script>

<div>
    <div class="mirror" style="background-color: {textValue}">
        <!-- svelte-ignore -->
        <input class="input" type="color" value={inputValue} on:change={handleChangeColor} />
    </div>
    <TextInput value={textValue} on:input={onChangeText} on:change={onChangeText} />
    {#if hasAlpha }
        <Field name="alpha" value={alpha} params={{min: 0, max: 1, step: 0.01}}></Field>
    {/if }
</div>

<style>
.input {
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    opacity: 0.5;
}

</style>
