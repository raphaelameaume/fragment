<input type="text" class="input" value={value} disabled={disabled} style={`width: ${width}; ${style}`} on:change={handleChange} bind:this={input} on:keyup={handleKeyUp} on:keydown={handleKeyDown} on:focus={handleFocus} on:blur={handleBlur}/>

<script>
import { clamp } from "../math/clamp.js";
import noop from "../utils/noop.js";

export let onSubmit = noop;
export let onChange = noop;
export let onBlur = noop;
export let onFocus = noop;
export let onKeyDown = noop;
export let onKeyUp = noop;
export let width = 'auto';
export let value;
export let type = typeof value;
export let step = 0.1;
export let min = null;
export let max = null;
export let style = '';
export let disabled = false;

let input;

function handleKeyDown(event) {
    console.log('keydown', event);

    if (event.keyCode === 38) { // ArrowUp
        if (type === 'number') {
            event.preventDefault();

            value += step;


            value = Math.round(value * (1 / step)) / (1 / step);
            

            if (min !== undefined && max !== undefined) {
                value = clamp(value, min, max);
            }
        }
    }

    if (event.keyCode === 40) { // ArrowDown
        if (type === 'number') {
            event.preventDefault();

            value -= step;
            value = Math.round(value * (1 / step)) / (1 / step);

            if (min !== undefined && max !== undefined) {
                value = clamp(value, min, max);
            }
        }
    }

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
        onSubmit(value);
    }
}

</script>

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

