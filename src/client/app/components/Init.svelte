<script>
	import { assignSketchFiles } from '../triggers/shared.js';
	import { loadAll, sketchesKeys } from '../stores/sketches.js';
	import { onSketchReload } from '@fragment/sketches';
	import '../utils/glslErrors.js';

	sketchesKeys.subscribe((keys) => {
		if (keys.length > 0) {
			assignSketchFiles(keys);
		}
	});

	onSketchReload(({ sketches }) => {
		loadAll(sketches);
	});
</script>
