<div class="container" style="{value && value.src ? `background-image: url(${value.src})`: ''}" on:click={handleClick}>
    <input type="file" class="input" on:change={handleUpload} bind:this={input}/>
</div>

<script>
import noop from "../utils/noop.js";
import loadImage from "../utils/loadImage.js";

export let value;
export let onChange = noop;

let input;

if (value && !value.src) {
    loadImage(value, (image) => {
        onChange({ image, name: value });
    });
}

function load(src) {
}

function handleClick() {
    input.click();
}

function handleUpload(event) {
    let file = event.target.files[0];
    let name = file.name;

    let reader = new FileReader();
    reader.onload = (e) => {
        loadImage(e.target.result, (image) => {
            onChange({ image, name });
        });
    };

	reader.readAsDataURL(file);
}

</script>

<style>
.container {
    width: 60px;
    height: 60px;
    margin: 0 1px 0 0;

    background-position: center;
    background-size: 100%;
    background-repeat: no-repeat;
    border-radius: 2px;
    background-color: #1d1d1e;
    border: 1px solid black;

    cursor: pointer;
}

.input {
    display: none;
}
</style>