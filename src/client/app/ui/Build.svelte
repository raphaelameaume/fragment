<script>
	import { onDestroy } from 'svelte';

	import Monitor from '../modules/Monitor.svelte';
	import Params from '../modules/Params.svelte';
	import { layout } from '../stores/layout';
	import { override, preview } from '../stores/rendering';
	import { sketches, sketchesKeys } from '../stores/sketches';
	import FloatingParams from './FloatingParams.svelte';
	import Column from './LayoutColumn.svelte';
	import Row from './LayoutRow.svelte';

	console.log(`Made with Fragment. https://fragment.tools`);

	let gui, style, head;
	let defaultGUIConfig = {
		position: 'float',
		align: 'right',
		size: 0.3,
		output: false,
		hidden: false,
	};

	let guiConfig = defaultGUIConfig;
	$: sketchKey = $layout.previewing && $preview ? $preview : $sketchesKeys[0];
	$: sketch = $sketches[sketchKey];

	$: {
		if (sketch) {
			if (sketch.buildConfig) {
				override(sketch.buildConfig);
			}

			const config = sketch.buildConfig ? sketch.buildConfig : {};
			gui = config.gui;

			if (gui && typeof gui === 'object') {
				guiConfig = {
					...defaultGUIConfig,
					...gui,
				};
			}

			const { styles = '' } = config;

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
		}
	}

	onDestroy(() => {
		if (style && head) {
			head.removeChild(style);
		}
	});
</script>

{#if gui}
	{#if guiConfig.position === 'fixed'}
		<Row>
			{#if guiConfig.align === 'right'}
				<Column size={1 - guiConfig.size}>
					<Monitor hasHeader={false} {sketchKey} />
				</Column>
				<Column size={guiConfig.size}>
					<Params hasHeader={false} {output} />
				</Column>
			{:else}
				<Column size={guiConfig.size}>
					<Params hasHeader={false} {output} />
				</Column>
				<Column size={1 - guiConfig.size}>
					<Monitor hasHeader={false} {sketchKey} />
				</Column>
			{/if}
		</Row>
	{:else}
		<Monitor hasHeader={false} {sketchKey} />
		<FloatingParams
			output={guiConfig.output}
			align={guiConfig.align}
			size={guiConfig.size}
			hidden={guiConfig.hidden}
		/>
	{/if}
{:else}
	<Monitor hasHeader={false} />
{/if}
