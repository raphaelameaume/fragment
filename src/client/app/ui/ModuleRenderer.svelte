<script context="module">
	export let moduleNames = [
		'monitor',
		'params',
		'midi',
		'console',
		'exports',
	];
</script>

<script>
	import Module from './Module.svelte';

	let { name, hasHeader = true, isDynamic = false } = $props();

	const moduleList = {
		monitor: () => import('../modules/Monitor.svelte'),
		params: () => import('../modules/Params.svelte'),
		midi: () => import('../modules/MidiPanel.svelte'),
		console: () => import('../modules/Console.svelte'),
		exports: () => import('../modules/Exports.svelte'),
	};
</script>

{#if moduleList[name]}
	{#await moduleList[name]()}
		<Module {hasHeader} {name} />
	{:then value}
		<svelte:component this={value.default} {hasHeader} />
	{:catch error}
		<p>Something went wrong: {error.message}</p>
	{/await}
{:else}
	<Module {hasHeader} {name} />
{/if}
