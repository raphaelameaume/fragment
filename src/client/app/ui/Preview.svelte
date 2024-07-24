<script>
	import { onDestroy } from 'svelte';

	import { rendering } from '../state/rendering.svelte';
	import Build from './Build.svelte';

	const { resizing, width, height, pixelRatio, aspectRatio, scale, preset } =
		rendering;

	console.log('resizing', resizing, width, height);

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
		console.log('restore rendering', prevRendering);

		rendering.override(prevRendering);

		console.log(rendering.resizing);
	});
</script>

<Build />
