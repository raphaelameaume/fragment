<div class="checkbox">
    <input class="input" type="checkbox" bind:checked={prop.value} />
    <div class="checked"></div>
</div>

<style>
.checkbox {
    position: relative;
    
    width: 20px;
    height: 20px;
    
    background: #1d1d1e;
    border: 1px solid black;
    border-radius: 2px;
    cursor: pointer;
}

.input {
    position: absolute;
    top: -1px;
    left: -1px;

    width: 20px;
    height: 20px;
    margin: 0;
    padding: 0;

    -webkit-appearance: none;
    border: none;
    outline: 0;
    cursor: pointer;
}

.checked {
    position: absolute;
    top: 3px;
    left: 3px;

    width: 12px;
    height: 12px;
    border-radius: 2px;

    background-color: #448eea;
    opacity: 0;
    pointer-events: none;
}

.input:checked + .checked {
    opacity: 1;
}
</style>

<script>
export let prop = {};
export let checked = false;
</script>