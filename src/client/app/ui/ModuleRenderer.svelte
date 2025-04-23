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
	import Monitor from '../modules/Monitor.svelte';
	import Exports from '../modules/Exports.svelte';
	import MidiPanel from '../modules/MidiPanel.svelte';
	import Console from '../modules/Console.svelte';
	import Params from '../modules/Params.svelte';
	import { configModulesList } from 'virtual:config-modules';

	let { id, name, headless = false, params = {} } = $props();

	const modulesList = {
		monitor: Monitor,
		params: Params,
		midi: MidiPanel,
		console: Console,
		exports: Exports,
		...configModulesList,
	};

	let Component = $derived(modulesList[name]);

	// if (!__BUILD__) {
	// 	Object.assign(moduleList, {
	// 		midi: () => import('../modules/MidiPanel.svelte'),
	// 		console: () => import('../modules/Console.svelte'),
	// 		exports: () => import('../modules/Exports.svelte'),
	// 	});
	// }
</script>

{#if Component}
	<Component {id} {headless} {params} />
{:else}
	<div class="module-renderer">
		<header class="module-renderer-header">
			<span>Error</span>
		</header>
		<div class="module-renderer-error">
			<div>
				<p class="message">
					Something went wrong while loading module:
					<span class="module-name">{name}</span>
				</p>
			</div>
		</div>
	</div>
{/if}

<!-- {#await buildConfig.layout.component() then layoutModule}
	{@const LayoutBuildCustom = layoutModule.default}
	<LayoutBuildCustom {sketchKey} {buildConfig} {sketch} />
{/await} -->
<!--
{#if name === 'monitor'}
	<Monitor {id} {headless} {params} />
{:else if name === 'exports'}
	<Exports {id} {headless} {params} />
{:else if name === 'console'}
	<Console {id} {headless} {params} />
{:else if name === 'params'}
	<Params {id} {headless} {params} />
{:else if name === 'midi'}
	<MidiPanel {id} {headless} {params} />
{:else}{/if} -->

<style>
	.module-renderer {
		display: grid;
		grid-template-rows: 25px 1fr;
	}

	.module-renderer-header {
		display: flex;
		height: 25px;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;

		color: white;
		font-size: 10px;
		text-transform: capitalize;
		user-select: none;

		background-color: var(--color-lightblack);
	}

	.module-renderer-error {
		display: flex;
		flex-direction: column;
		justify-content: center;
		color: var(--color-red);
		font-size: 11px;
		text-align: center;
		background: #2a0000;
		border-color: #5c0000;
	}

	.message {
		color: var(--color-text);
	}

	.module-name {
		text-transform: capitalize;
	}
</style>
