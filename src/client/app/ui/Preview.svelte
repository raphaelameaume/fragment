<script>
	import { onDestroy, onMount } from 'svelte';

	import { rendering } from '../state/rendering.svelte';
	import Build from './Build.svelte';

	const { resizing, width, height, pixelRatio, aspectRatio, scale, preset } =
		rendering;

	onDestroy(() => {
		const prevRendering = {
			resizing,
			width,
			height,
			pixelRatio,
			aspectRatio,
			scale,
			preset,
		};

		rendering.override(prevRendering);
	});
</script>

<Build />
