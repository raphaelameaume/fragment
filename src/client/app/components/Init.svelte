<script>
	import { assignSketchFiles } from '../triggers/shared.js';
	// import { loadAll, sketchesKeys, sketches } from '../stores/sketches.js';
	import { loadAll, sketchesKeys, sketches } from '../state/sketches.svelte.js';
	import { onSketchReload } from '@fragment/sketches';
	import { getFilename } from '../utils/file.utils.js';
	import '../utils/glslErrors.js';
	import { props, reconcile } from '../state/props.svelte.js';

	$effect(() => {
		Object.keys(sketches).forEach((key) => {
			const sketch = sketches[key];

			if (sketch) {
				// sketch can be undefined if failed to load
				props[key] = reconcile(
					sketch.props,
					props[key],
				);
			}
		});
	});


	$effect(() => {
		assignSketchFiles(sketchesKeys);
	})

	onSketchReload(({ sketches }) => {
		loadAll(sketches);
	});

	let prefix = $derived(sketchesKeys.length === 1 ? `${getFilename(sketchesKeys[0])} | ` : '');
	let title = $derived(`${prefix}fragment`);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
