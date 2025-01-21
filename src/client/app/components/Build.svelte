<script>
	import { onDestroy } from 'svelte';
	import { sketchesManager } from '../state/sketches.svelte';
	import { rendering } from '../state/rendering.svelte';
	import { layout } from '../state/layout.svelte';
	import LayoutBuild from '../ui/LayoutBuild.svelte';

	console.log(`Made with Fragment. https://fragment.tools`);

	let sketchKey = $derived(sketchesManager.keys[0]);
	let sketch = $derived(sketchesManager.sketches[sketchKey]);
	let buildConfig = $derived(sketch?.buildConfig ?? {});
	let persistent = $derived(buildConfig.layout?.persistent ?? false);
	let styles = $derived(buildConfig?.styles ?? '');

	/** @type {HTMLHeadElement} */
	let head;
	/** @type {HTMLStyleElement} */
	let style;

	$effect(() => {
		if (__BUILD__) {
			layout.persistent = persistent;
		} else if (persistent && layout.previewing) {
			console.warn(`Layout is not preserved while previewing`);
		}
	});

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
	{#if buildConfig.layout?.component}
		{#await buildConfig.layout.component() then layoutModule}
			{@const LayoutBuildCustom = layoutModule.default}
			<LayoutBuildCustom {sketchKey} {buildConfig} {sketch} />
		{/await}
	{:else}
		<LayoutBuild {sketchKey} {sketch} {buildConfig} />
	{/if}
{/if}
