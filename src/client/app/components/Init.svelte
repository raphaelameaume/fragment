<script>
	import { assignSketchFiles } from '../triggers/shared.js';
	import { loadAll, sketchesKeys } from '../stores/sketches.js';
	import { onSketchReload } from '@fragment/sketches';
	import { getFilename } from '../utils/file.utils.js';
	import '../utils/glslErrors.js';

	sketchesKeys.subscribe((keys) => {
		if (keys.length > 0) {
			assignSketchFiles(keys);
		}
	});

	onSketchReload(({ sketches }) => {
		loadAll(sketches);
	});

	$: prefix =
		$sketchesKeys.length === 1 ? `${getFilename($sketchesKeys[0])} | ` : '';

	$: title = `${prefix}fragment`;
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
