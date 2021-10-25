<script>
import { setContext } from "svelte";
import SketchRenderer from "./SketchRenderer.svelte";

export let renderer;

setContext('renderer', renderer);

</script>

<SketchRenderer key="grid.js" />
