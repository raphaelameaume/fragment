<script>
	import Input from './Input.svelte';

	let { value, label = '', disabled = false, context = null, key = ''} = $props();
</script>

<div class="text-input">
	<Input {context} {key} bind:value {label} {disabled} on:change on:input />
</div>

<style>
	.text-input {
		width: 100%;
	}
</style>
