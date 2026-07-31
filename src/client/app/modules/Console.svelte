<script>
	import { onMount } from 'svelte';
	import Module from '../ui/Module.svelte';
	import ModuleHeaderAction from '../ui/ModuleHeaderAction.svelte';
	import ConsoleLine from './Console/ConsoleLine.svelte';

	let { id, headless = false } = $props();

	let logs = $state([]);
	let mirrored = ['log', 'warn', 'error', 'dir'];
	let refs = {};
	let clear = console.clear;
	/** @type {HTMLDivElement}*/
	let scrollableContainer;

	function enable() {
		mirrored.forEach((key) => {
			const ref = console[`${key}`];
			refs[`${key}`] = ref;
			// window[`${key}`] = ref;

			console[`${key}`] = (...args) => {
				let isFromVite = args.some(
					(log) => typeof log === 'string' && log.includes('[vite]'),
				);

				if (!isFromVite) {
					ref(...args);

					if (logs.length > 0) {
						const lastLog = logs[logs.length - 1];
						const { level: lastLevel, args: lastArgs } = lastLog;

						if (lastLevel === key && lastArgs[0] === args[0]) {
							logs[logs.length - 1].count++;
							return;
						}
					}

					logs.push({
						level: key,
						args,
						count: 1,
					});
				}
			};
		});

		console.clear = () => {
			clear();
			logs = [];
		};
	}

	function disable() {
		mirrored.forEach((key) => {
			const ref = refs[key];

			console[`${key}`] = ref;
		});

		console.clear = clear;
	}

	onMount(() => {
		enable();
		return () => {
			disable();
		};
	});
</script>

<Module {id} {headless} name="console" scrollable={false}>
	{#snippet headerRight()}
		<ModuleHeaderAction
			permanent
			border
			label="Clear"
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();

				logs = [];
			}}>clear</ModuleHeaderAction
		>
	{/snippet}
	<div class="container">
		<div class="list">
			<div class="scroll" bind:this={scrollableContainer}>
				{#each logs as log}
					<ConsoleLine log={$state.snapshot(log)} />
				{/each}
			</div>
		</div>
	</div>
</Module>

<style>
	.container {
		position: relative;

		height: 100%;
		max-height: 100%;
		padding: 4px;
	}

	.list {
		position: relative;

		margin-right: var(--padding);
		padding: 1px 1px;

		height: 100%;
		max-height: 100%;

		background-color: #1d1d1e;
		border-radius: var(--fragment-input-border-radius);
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);
	}

	.scroll {
		height: 100%;
		overflow-x: hidden;
		overflow-y: scroll;

		scroll-snap-type: y proximity;
	}

	.scroll::after {
		display: block;
		content: '';
		scroll-snap-align: end;
	}

	.scroll::-webkit-scrollbar {
		width: 5px; /* width of the entire scrollbar */
	}

	.scroll::-webkit-scrollbar-track {
		background-color: var(
			--fragment-color-lightblack
		); /* color of the tracking area */
	}

	.scroll::-webkit-scrollbar-thumb {
		background-color: var(
			--fragment-accent-color
		); /* color of the scroll thumb */
		border-radius: 20px; /* roundness of the scroll thumb */
	}
</style>
