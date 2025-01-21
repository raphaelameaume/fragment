<script>
	import { rendering } from '../state/rendering.svelte';
	import { onDestroy } from 'svelte';
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
