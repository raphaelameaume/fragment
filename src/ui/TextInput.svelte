<input type="text" class="input" value={value} disabled={disabled} style={`width: ${width}`} on:change={onChange} bind:this={input} on:keyup={handleKeyUp} on:focus={handleFocus} on:blur={handleBlur}/>

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
</style>

<script>
export let onSubmit = () => {};
export let onChange = () => {};
export let value = '';
export let width = 'auto';
export let disabled = false;

let input;


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

