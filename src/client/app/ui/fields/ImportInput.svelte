<script>
	import ButtonInput from './ButtonInput.svelte';

	let {
		value,
		label = 'import',
		disabled = false,
		title = '',
		accept,
		readAs = 'readAsText',
		children,
	} = $props();

	/** @type {HTMLInputElement}*/
	let input;

	let fileReader = new FileReader();
	fileReader.onload = (event) => {
		value(event);
	};

	function handleClick(event) {
		event.preventDefault();
		input.click();
	}

	function handleChange(event) {
		if (event.target.files.length > 0) {
			const readAsFn = fileReader[readAs];

			if (!readAsFn) {
				console.error(
					`readAs: '${readAs}' is not a function of FileReader.`,
				);
				return;
			}

			readAsFn.call(fileReader, event.target.files[0]);
		}
	}
</script>

<ButtonInput onclick={handleClick} {disabled} {label} {title}>
	{@render children?.()}
</ButtonInput>
<input
	class="visually-hidden"
	onchange={handleChange}
	type="file"
	bind:this={input}
	{accept}
/>
