<script>
	import Input from './Input.svelte';

	let {
		value = $bindable(),
		label = '',
		disabled = false,
		context = null,
		key = '',
		onchange,
		oninput
	} = $props();
</script>

<div class="text-input">
	<Input {context} {key} bind:value {label} {disabled} {onchange} {oninput} />
</div>

<style>
	.text-input {
		width: 100%;
	}
</style>
