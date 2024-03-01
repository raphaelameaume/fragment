<script>
	import { assignSketchFiles } from '../triggers/shared.js';
	import { loadAll, sketchesKeys, sketches } from '../stores/sketches.js';
	import { onSketchReload } from '@fragment/sketches';
	import { getFilename } from '../utils/file.utils.js';
	import '../utils/glslErrors.js';
	import { props, reconcile } from '../stores/props.js';

	sketches.subscribe((sketches) => {
		props.update((currentProps) => {
			Object.keys(sketches).forEach((key) => {
				const sketch = sketches[key];

				if (sketch) {
					// sketch can be undefined if failed to load
					currentProps[key] = reconcile(
						sketch.props,
						currentProps[key],
					);
				}
			});

			return currentProps;
		});
	});

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
