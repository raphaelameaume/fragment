<script>
	import { assignSketchFiles } from '../triggers/shared.js';
	import { sketchesManager } from '../state/sketches.svelte.js';
	import { onSketchReload } from '@fragment/sketches';
	import { getFilename } from '../utils/file.utils.js';
	import '../utils/glslErrors.js';
	import KeyBinding from './KeyBinding.svelte';
	import { rendering } from '../state/rendering.svelte.js';
	import { exports } from '../state/exports.svelte.js';

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

	function checkForRefresh(event) {
		if (!event.metaKey && !event.ctrlKey) {
			event.preventDefault();
			rendering.reset();
		}
	}

	function checkForPause(event) {
		if (!event.metaKey || !event.ctrlKey) {
			event.preventDefault();

			if (!exports.recording) {
				rendering.paused = !rendering.paused;
			} else {
				console.warn(`Fragment can't be paused while recording.`);
			}
		}
	}

	function checkForScreenshot(event) {
		if (event.metaKey || event.ctrlKey) {
			event.preventDefault();

			if (!exports.recording) {
				rendering.screenshot();
			} else {
				console.warn(`Fragment can't screenshot while recording.`);
			}
		}
	}

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

<KeyBinding type="down" key="r" onTrigger={checkForRefresh} />
<KeyBinding type="down" key=" " onTrigger={checkForPause} />
<KeyBinding type="down" key="s" onTrigger={checkForScreenshot} />
<KeyBinding
	type="down"
	key="S"
	onTrigger={() => (exports.recording = !exports.recording)}
/>
