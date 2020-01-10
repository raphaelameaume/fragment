<button class="field__value--button" style={style} on:click={onClick}><slot></slot></button>

<style>
.field__value--button {
    display: flex;
    border-radius: 2px;
    background: #1d1d1e;
    border: 1px solid black;
    color: #f0f0f0;
    font-size: 10px;
    height: 20px;
    cursor: pointer;
    line-height: 10px;
}

.field__value--button:hover, .field__value--button:focus {
    background: #131314;
}

.field__value--button:active {
    background-color: #448eea;
}
</style>

<script>
export let onClick = () => {};
export let style = "";
</script>