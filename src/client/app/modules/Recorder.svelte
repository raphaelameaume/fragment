<script context="module">
let instances = 0;
</script>

<script>
import { getContext, onMount, setContext } from "svelte";
import { sketchesCount } from "@fragment/props";
import { current as currentLayout } from "../stores/layout.js";
import { props } from "../stores";
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentSketches } from "../stores/sketches.js";

import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";

let formats = [".mp4", ".gif"];

let record = () => {

};

</script>

<Module name="recorder">
    <Field key="framerate" value={60} />
	<Field key="format" value={".mp4"} params={{ options: formats }} />
	<Field key="useDuration" value={true} />
	<Field key="record" value={record} params={{ label: "start" }} />
</Module>
