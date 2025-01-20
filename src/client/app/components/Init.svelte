<script>
	import { assignSketchFiles } from '../triggers/shared.js';
	import { sketchesManager } from '../state/sketches.svelte.js';
	import { onSketchReload } from '@fragment/sketches';
	import { getFilename } from '../utils/file.utils.js';
	import '../utils/glslErrors.js';

	$effect(() => {
		assignSketchFiles(sketchesManager.keys);
	});

	$effect(() => {
		Object.keys(sketchesManager.sketches).forEach((key) => {
			sketchesManager.sketches[key].save();
		});
	});

	onSketchReload(({ sketches }) => {
		sketchesManager.loadAll(sketches);
	});

	let prefix = $derived(
		sketchesManager.keys.length === 1
			? `${getFilename(sketchesManager.keys[0])} | `
			: '',
	);
	let title = $derived(`${prefix}fragment`);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
