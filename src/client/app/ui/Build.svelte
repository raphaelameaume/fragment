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

	let sketchKey = $derived(Object.keys(sketchesManager.sketches)[0]);
	let sketch = $derived(sketchesManager.sketches[sketchKey]);

	let gui = $derived(sketch?.buildConfig?.gui);
	let guiOutput = $derived(gui?.output);
	let guiAlign = $derived(gui?.align);
	let guiHidden = $derived(gui?.hidden);
	let guiSize = $derived(gui?.size);
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

{#if gui}
	{#if guiPosition === 'fixed'}
		<Row>
			{#if guiAlign === 'right'}
				<Column size={1 - guiSize}>
					<Monitor hasHeader={false} {sketchKey} />
				</Column>
				<Column size={guiSize}>
					<Params hasHeader={false} />
				</Column>
			{:else}
				<Column size={guiSize}>
					<Params hasHeader={false} />
				</Column>
				<Column size={1 - guiSize}>
					<Monitor hasHeader={false} {sketchKey} />
				</Column>
			{/if}
		</Row>
	{:else}
		<Monitor hasHeader={false} {sketchKey} />
		<FloatingParams
			output={guiOutput}
			align={guiAlign}
			size={guiSize}
			hidden={guiHidden}
			minimize={guiMinimize}
		/>
	{/if}
{:else}
	<Monitor hasHeader={false} />
{/if}
