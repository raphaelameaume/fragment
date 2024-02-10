<script>
	import Input from './Input.svelte';

	export let value;
	export let label = '';
	export let disabled = false;
	export let context = null;
	export let key = '';
</script>

<div class="text-input">
	<Input {context} {key} bind:value {label} {disabled} on:change on:input />
</div>

<style>
	.text-input {
		width: 100%;
	}
</style>
