<script>
import { onMount, setContext } from "svelte";
import SketchRenderer from "./SketchRenderer.svelte";

export let renderer;

setContext('renderer', renderer);

onMount(() => {
	document.documentElement.style.setProperty("--backgroundColor", "#000000");
	document.documentElement.style.setProperty("--color-lightblack", "#000000");
});

</script>

<SketchRenderer key="grid.js" />
