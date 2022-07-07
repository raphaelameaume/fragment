<script>
import { onMount } from "svelte";
import { loadImage } from "../../lib/loader/loadImage";
import TextInput from "./TextInput.svelte";

export let value;

let img, input, name;
$: url = typeof value === HTMLImageElement ? value.src : value;
$: displayUrl = name ? name : url.replace(`/@fs${__CWD__}`, '');
$: {
	;(async () => {
		await loadImage(url, { img });
	})();
}

function handleClick() {
	input.click();
}

let reader = new FileReader();
let dragover = false;

function handleUpload(event) {
	event.preventDefault();
	event.stopPropagation();

	let file;

	if (event.dataTransfer) {
        file = event.dataTransfer.files[0];
	} else if(event.target) {
        file = event.target.files[0];
    }

    name = file.name;

    reader.onload = async (e) => {
		reader.onload = null;

		value = e.target.result;
    };
	reader.readAsDataURL(file);

	dragover = false;
}

function handleDragover(event) {
	event.preventDefault();
	event.stopPropagation();

	dragover = true;
}

function handleDragleave(event) {
	event.preventDefault();
	event.stopPropagation();

	dragover = false;
}

</script>

<div class="img-container">
	<div
		class="preview"
		on:click={handleClick}
		class:dragover={dragover}
		on:dragover={handleDragover}
		on:dragleave={handleDragleave}
		on:drop={handleUpload}
	>
		<img class="img" src="" alt="" bind:this={img}/>
		<input class="input" type="file" bind:this={input} on:change={handleUpload} />
	</div>
	<TextInput disabled value={displayUrl} />
</div>

<style>
.img-container {
	width: 100%;
	/* display: flex; */
}

.preview {
	width: 100%;

	display: grid;
	place-items: center;
	padding: var(--padding);

	border-radius: var(--border-radius-input);
    background-color: var(--color-background-input);
    box-shadow: inset 0 0 0 1px var(--color-border-input);

	cursor: copy;
}

.preview:hover {
    color: var(--color-text);

    box-shadow: inset 0 0 0 1px var(--box-shadow-color, var(--color-active));
}

.preview:active, .preview.dragover {
    box-shadow: 0 0 0 2px var(--box-shadow-color, var(--color-active));
}

.preview.dragover {
	cursor: copy;
}

.img {
	height: calc(var(--height-input) * 3);
}

.input {
	display: none;
}

</style>
