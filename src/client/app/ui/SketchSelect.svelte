<script>
	import ModuleHeaderAction from './ModuleHeaderAction.svelte';
	import { sketchesManager } from '../state/sketches.svelte';

	let { sketchKey = sketchesManager.keys[0], onchange } = $props();

	let options = $derived(
		[
			...sketchesManager.keys.map((key) => {
				const name = sketchesManager.sketches[key].name ?? key;
				return { value: key, label: name };
			}),
			sketchesManager.count > 1
				? { value: 'output', label: 'output' }
				: undefined,
		].filter((opt) => opt !== undefined),
	);
</script>

<ModuleHeaderAction value={sketchKey} permanent border {onchange} {options} />
