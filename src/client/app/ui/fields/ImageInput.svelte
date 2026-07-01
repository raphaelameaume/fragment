<script>
	import { loadImage } from '../../lib/loader/loadImage';
	import ButtonInput from './ButtonInput.svelte';
	import FieldInputRow from './FieldInputRow.svelte';
	import TextInput from './TextInput.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {string|HTMLImageElement|string[]|HTMLImageElement[]} value
	 * @property {boolean} disabled
	 * @property {(value: string|HTMLImageElement|string[]|HTMLImageElement[]) => void|undefined} onchange
	 */

	/** @type {Props} */
	let { value, onchange, disabled = false } = $props();

	/** @type {HTMLImageElement} */
	let img;
	/** @type {HTMLInputElement} */
	let input;

	let name = $state('');
	let url = $derived.by(() => {
		if (value instanceof HTMLImageElement) {
			return value.src;
		}

		if (Array.isArray(value)) {
			if (value.every((v) => v instanceof HTMLImageElement)) {
				return value[0].src;
			}

			return value[0];
		}

		return value;
	});
	let displayUrl = $derived(name ? name : url.replace(`/@fs${__CWD__}`, ''));

	$effect(() => {
		loadImage(url, { img });
	});

	function handleClick() {
		input.click();
	}

	let dragover = $state(false);

	/**
	 *
	 * @param {Event | DragEvent} event
	 */
	function handleUpload(event) {
		/** @type {File[]} */
		let files = [];

		if ('dataTransfer' in event && event.dataTransfer) {
			files = [...event.dataTransfer.files];
		} else if (event.target) {
			let target = /** @type {HTMLInputElement} */ (event.target);
			files = [...(target?.files ?? [])];
		}

		if (files.length > 0) {
			name = files[0].name;

			/** @type {string[]} */
			let values = [];

			files.forEach((file, index) => {
				let reader = new FileReader();

				/**
				 *
				 * @param {ProgressEvent} e
				 */
				reader.onload = (e) => {
					reader.onload = null;

					const result =
						typeof reader.result === 'string' && reader.result;

					console.log(result);

					if (result) {
						if (index === 0 && e.target) {
							value = result;
						}

						if (files.length === 1) {
							onchange(value);
						} else {
							values.push(result);

							if (values.length === files.length) {
								onchange(values);
							}
						}
					}
				};
				reader.readAsDataURL(file);
			});
		}

		dragover = false;
	}

	/**
	 * @param {DragEvent} event
	 */
	function handleDragover(event) {
		event.preventDefault();
		event.stopPropagation();

		dragover = true;
	}

	/**
	 * @param {DragEvent} event
	 */
	function handleDragleave(event) {
		event.preventDefault();
		event.stopPropagation();

		dragover = false;
	}
</script>

<div
	class="img-container"
	role="group"
	aria-label="Drop an image here to upload"
	class:dragover
	ondragover={handleDragover}
	ondragleave={handleDragleave}
	ondrop={handleUpload}
>
	<FieldInputRow --grid-template-columns="1fr 0.5fr">
		<div class="row">
			<div class="preview">
				<img class="img" src="" alt="" bind:this={img} />
				<button class="preview-button" onclick={handleClick}>
					<span class="visually-hidden">Upload</span>
				</button>
				<input
					class="input"
					type="file"
					bind:this={input}
					onchange={handleUpload}
					{disabled}
					multiple
				/>
			</div>
			<TextInput disabled value={displayUrl} />
		</div>
		<ButtonInput label="change" onclick={handleClick} {disabled} />
	</FieldInputRow>
</div>

<style>
	.img-container {
		width: 100%;
	}

	.preview {
		position: relative;

		width: calc(var(--fragment-input-height) * 1);
		height: calc(var(--fragment-input-height) * 1);
		display: grid;
		place-items: center;

		border-radius: var(--fragment-input-border-radius);
		background-color: var(--fragment-input-background-color);
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);

		cursor: copy;
		overflow: hidden;
	}

	.preview-button {
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		opacity: 0;
	}

	.row {
		display: grid;
		grid-template-columns: 20px auto;
		gap: var(--column-gap);
		place-items: center;
	}

	.preview:hover {
		color: var(--fragment-text-color);

		box-shadow: inset 0 0 0 1px
			var(--box-shadow-color, var(--fragment-accent-color));
	}

	.preview:active,
	.img-container.dragover .preview {
		box-shadow: 0 0 0 2px
			var(--box-shadow-color, var(--fragment-accent-color));
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
