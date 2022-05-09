<script>
import { onMount } from "svelte";

import { canvases, multisampling } from "../stores/rendering";

import OutputRenderer from "../ui/OutputRenderer.svelte";
import SketchRenderer from "../ui/SketchRenderer.svelte";

$multisampling = [0, 1];

let sketch0, sketch1;

onMount(async () => {
	const response = await fetch('/db');
	const json = await response.json();

	sketch0 = json.output.sampler0;
	sketch1 = json.output.sampler1;
});

</script>

{#if sketch0 }
	<SketchRenderer key={sketch0} visible={false} index={0}/>
{/if}
{#if sketch1 }
	<SketchRenderer key={sketch1} visible={false} index={1}/>
{/if}
<OutputRenderer/>
