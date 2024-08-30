<script>
	import ModuleHeaderAction from './ModuleHeaderAction.svelte';
	import { sketchesManager } from '../state/sketches.svelte';
	import {
		sketches,
		sketchesKeys,
		sketchesCount,
	} from '../stores/sketches.js';
	import { monitors } from '../stores/rendering';

	let { sketchKey = sketchesManager.keys[0], onchange } = $props();

	let options = $derived(
		[
			...sketchesManager.keys.map((key) => {
				// @TODO: read sketch name if it exists
				return { value: key, label: key };
			}),
			sketchesManager.count > 1
				? { value: 'output', label: 'output' }
				: undefined,
		].filter((opt) => opt !== undefined),
	);
</script>

<ModuleHeaderAction value={sketchKey} permanent border {onchange} {options} />
