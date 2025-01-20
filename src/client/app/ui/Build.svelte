<script>
	import { onDestroy } from 'svelte';

	import Monitor from '../modules/Monitor.svelte';
	import Params from '../modules/Params.svelte';
	import FloatingParams from './FloatingParams.svelte';
	import Column from './LayoutColumn.svelte';
	import Row from './LayoutRow.svelte';
	import { sketchesManager } from '../state/sketches.svelte';
	import { rendering } from '../state/rendering.svelte';

	console.log(`Made with Fragment. https://fragment.tools`);

	let sketchKey = $derived(sketchesManager.keys[0]);

	let sketch = $derived(sketchesManager.sketches[sketchKey]);

	let gui = $derived(sketch?.buildConfig?.gui);
	let guiOutput = $derived(gui?.output);
	let guiAlign = $derived(gui?.align ?? 'right');
	let guiHidden = $derived(gui?.hidden);
	let guiSize = $derived(gui?.size ?? 0.25);
	let guiMinimize = $derived(gui?.minimize);
	let guiPosition = $derived(gui?.position);
	let styles = $derived(sketch?.buildConfig?.styles ?? '');

	/** @type {HTMLHeadElement} */
	let head;
	/** @type {HTMLStyleElement} */
	let style;

	$effect(() => {
		rendering.override(sketch?.buildConfig);
	});

	$effect(() => {
		if (styles !== '') {
			head = document.getElementsByTagName('head')[0];

			if (style) {
				head.removeChild(style);
			}

			style = document.createElement('style');
			style.setAttribute('type', 'text/css');
			style.appendChild(document.createTextNode(styles));
			head.appendChild(style);
		}
	});

	onDestroy(() => {
		if (style && head) {
			head.removeChild(style);
		}
	});
</script>

{#if sketch}
	{#if guiPosition === 'fixed'}
		<Row>
			{#if guiAlign === 'left'}
				<Column size={guiSize}>
					<Params />
				</Column>
				<Column size={1 - guiSize}>
					<Monitor params={{ selected: sketchKey }} />
				</Column>
			{:else}
				<Column size={1 - guiSize}>
					<Monitor params={{ selected: sketchKey }} />
				</Column>
				<Column size={guiSize}>
					<Params />
				</Column>
			{/if}
		</Row>
	{:else}
		<Row>
			<Monitor headless {sketchKey} params={{ selected: sketchKey }} />
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
{/if}
