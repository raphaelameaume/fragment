<script>
import { onMount } from "svelte";
import { loadImage } from "../../lib/loader/loadImage";
import ButtonInput from "./ButtonInput.svelte";
import FieldInputRow from "./FieldInputRow.svelte";
import TextInput from "./TextInput.svelte";

export let value;
export let context = null;
export let key = "";

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

<div
	class="img-container"
	class:dragover={dragover}
	on:dragover={handleDragover}
	on:dragleave={handleDragleave}
	on:drop={handleUpload}
>
	<FieldInputRow --grid-template-columns="1fr 0.5fr">
		<div class="row">
			<div
				class="preview"
				on:click={handleClick}
			>
				<img class="img" src="" alt="" bind:this={img}/>
				<input class="input" type="file" bind:this={input} on:change={handleUpload} />
			</div>
			<TextInput disabled value={displayUrl} />
		</div>
		<ButtonInput
			label="change"
			on:click={handleClick}
			on:dragover={handleDragover}
			on:dragleave={handleDragleave}
			on:drop={handleUpload}
		/>
	</FieldInputRow>
	
</div>

<style>
.img-container {
	width: 100%;
}

.preview {
	width: calc(var(--height-input) * 1);
	height: calc(var(--height-input) * 1);
;
	display: grid;
	place-items: center;

	border-radius: var(--border-radius-input);
    background-color: var(--color-background-input);
    box-shadow: inset 0 0 0 1px var(--color-border-input);

	cursor: copy;
	overflow: hidden;
}

.row {
	display: grid;
	grid-template-columns: 20px auto;
	gap: var(--column-gap);
	place-items: center;
}

.preview:hover {
    color: var(--color-text);

    box-shadow: inset 0 0 0 1px var(--box-shadow-color, var(--color-active));
}

.preview:active, .img-container.dragover .preview {
    box-shadow: 0 0 0 2px var(--box-shadow-color, var(--color-active));
}

.img-container.dragover {
	cursor: copy;
}

.img {
	max-width: calc(100% - var(--padding) * 0.5);
	max-height: calc(100% - var(--padding) * 0.5);
}

.input {
	display: none;
}

</style>
