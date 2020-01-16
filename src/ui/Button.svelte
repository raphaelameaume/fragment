<button class="button" style={style} on:click={onClick}><slot></slot></button>

<style>
.button {
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

.button:hover, .button:focus {
    background: #131314;
}

.button:active {
    background-color: #448eea;
}
</style>

<script>
export let onClick = () => {};
export let style = "";
</script>