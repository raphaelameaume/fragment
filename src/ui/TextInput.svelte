<input type="text" class="input" value={value} disabled={disabled} style={`width: ${width}; ${style}`} on:change={handleChange} bind:this={input} on:keyup={handleKeyUp} on:keydown={onKeyDown} on:focus={handleFocus} on:blur={handleBlur}/>

<style>
.input {
    background: #1d1d1e;
    border: 1px solid black;
    font-size: 10px;
    height: 20px;
    color: #f0f0f0;
    outline: 0;
    margin: 0;
}

.input:disabled {
    color: rgba(240, 240, 240, 0.3);
}

.input:focus {
    border: 1px solid #448eea;
}
</style>

<script>
import noop from "../utils/noop.js";

export let onSubmit = noop;
export let onChange = noop;
export let onBlur = noop;
export let onFocus = noop;
export let onKeyDown = noop;
export let onKeyUp = noop;
export let width = 'auto';
export let value;
export let style = '';
export let disabled = false;

let input;

function handleKeyDown(event) {
    onKeyDown(event);
}

function handleChange(event) {
    onChange(event.target.value);
}

function handleFocus() {

}

function handleBlur() {

}

function handleKeyUp() {
    if (event.keyCode === 13) {
        input.blur();
        onSubmit(input.value);
    }
}

</script>

