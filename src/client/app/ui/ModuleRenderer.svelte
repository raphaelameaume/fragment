<script context="module">
	export let moduleNames = [
		'monitor',
		'params',
		'midi',
		'console',
		'exports',
		'audio',
	];
</script>

<script>
	import Module from './Module.svelte';

	export let mID = undefined;
	export let name;
	export let hasHeader = true;

	const moduleList = {
		monitor: () => import('../modules/Monitor.svelte'),
		params: () => import('../modules/Params.svelte'),
		midi: () => import('../modules/MidiPanel.svelte'),
		console: () => import('../modules/Console.svelte'),
		exports: () => import('../modules/Exports.svelte'),
		audio: () => import('../modules/Audio/Audio.svelte'),
	};
</script>

{#if moduleList[name]}
	{#await moduleList[name]()}
		<Module {hasHeader} {mID} {name} />
	{:then value}
		<svelte:component this={value.default} {mID} {hasHeader} />
	{:catch error}
		<p>Something went wrong: {error.message}</p>
	{/await}
{:else}
	<Module {hasHeader} {mID} {name} />
{/if}
