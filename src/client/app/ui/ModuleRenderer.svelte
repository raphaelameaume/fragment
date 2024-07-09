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

	let { id, name, hasHeader = true, isDynamic = false } = $props();

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
		<p>Loading module...</p>
		<!-- <Module {hasHeader} {name} {id}/> -->
	{:then value}
		<svelte:component this={value.default} {hasHeader} {id} />
	{:catch error}
		<p>Something went wrong: {error.message}</p>
	{/await}
{:else}
	<Module {hasHeader} {name} {id}/>
{/if}
