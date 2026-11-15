<script>
	import Monitor from '../modules/Monitor.svelte';
	import Params from '../modules/Params.svelte';
	import FloatingParams from './FloatingParams.svelte';
	import Column from './LayoutColumn.svelte';
	import Row from './LayoutRow.svelte';

	/**
	 * @typedef {import('../state/Sketch.svelte').SketchBuildConfig} SketchBuildConfig
	 * @typedef {import('../state/Sketch.svelte').SketchBuildConfigGUI} SketchBuildConfigGUI
	 */

	/**
	 * @typedef Props
	 * @property {SketchBuildConfig|undefined} buildConfig
	 * @property {string} sketchKey
	 */

	/**
	 * @type {Props}
	 */
	let { buildConfig, sketchKey } = $props();

	/**
	 * @type {SketchBuildConfigGUI|undefined}
	 */
	let gui = $derived.by(() => {
		const value = buildConfig?.gui;
		if (value && typeof value === 'object') return value;
		return value ? {} : undefined;
	});

	let layout = $derived(buildConfig?.layout);
	let headless = $derived(layout?.headless ?? false);
	let resizable = $derived(layout?.resizable ?? false);

	let guiOutput = $derived(gui?.output ?? true);
	let guiAlign = $derived(gui?.align ?? 'right');
	let guiHidden = $derived(gui?.hidden ?? false);
	let guiSize = $derived(gui?.size ?? 0.25);
	let guiRatio = $derived(typeof guiSize === 'number' ? guiSize : 0.25);
</script>

{#if gui?.position === 'fixed'}
	<Row>
		{#if guiAlign === 'left'}
			<Column size={guiRatio} {resizable}>
				<Params {headless} />
			</Column>
			<Column size={1 - guiRatio} {resizable}>
				<Monitor {headless} params={{ selected: sketchKey }} />
			</Column>
		{:else}
			<Column size={1 - guiRatio} {resizable}>
				<Monitor {headless} params={{ selected: sketchKey }} />
			</Column>
			<Column size={guiRatio} {resizable}>
				<Params {headless} />
			</Column>
		{/if}
	</Row>
{:else}
	<Row>
		<Monitor {headless} params={{ selected: sketchKey }} />
		{#if gui}
			<FloatingParams
				output={guiOutput}
				align={guiAlign}
				size={guiSize}
				hidden={!gui || guiHidden}
				minimize={gui?.minimize}
			/>
		{/if}
	</Row>
{/if}
