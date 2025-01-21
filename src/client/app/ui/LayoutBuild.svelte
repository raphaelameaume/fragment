<script>
	import Monitor from '../modules/Monitor.svelte';
	import Params from '../modules/Params.svelte';
	import FloatingParams from './FloatingParams.svelte';
	import Column from './LayoutColumn.svelte';
	import Row from './LayoutRow.svelte';

	let { buildConfig = {}, sketch, sketchKey } = $props();

	let gui = $derived(buildConfig.gui ?? {});
	let layout = $derived(buildConfig.layout ?? {});
	let headless = $derived(layout.headless ?? false);
	let resizable = $derived(layout.resizable ?? false);

	let guiOutput = $derived(gui.output ?? true);
	let guiAlign = $derived(gui.align ?? 'right');
	let guiHidden = $derived(gui?.hidden);
	let guiSize = $derived(gui?.size ?? 0.25);
	let guiMinimize = $derived(gui?.minimize);
	let guiPosition = $derived(gui?.position);
</script>

{#if guiPosition === 'fixed'}
	<Row>
		{#if guiAlign === 'left'}
			<Column size={guiSize} {resizable}>
				<Params {headless} />
			</Column>
			<Column size={1 - guiSize} {resizable}>
				<Monitor {headless} params={{ selected: sketchKey }} />
			</Column>
		{:else}
			<Column size={1 - guiSize} {resizable}>
				<Monitor {headless} params={{ selected: sketchKey }} />
			</Column>
			<Column size={guiSize} {resizable}>
				<Params {headless} />
			</Column>
		{/if}
	</Row>
{:else}
	<Row>
		<Monitor {headless} {sketchKey} params={{ selected: sketchKey }} />
		{#if gui}
			<FloatingParams
				output={guiOutput}
				align={guiAlign}
				size={guiSize}
				hidden={guiHidden}
				minimize={guiMinimize}
			/>
		{/if}
	</Row>
{/if}
