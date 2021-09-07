<script>
import { onMount } from "svelte";
import Stage from "./Stage.svelte";
import { init as initRenderer } from "./lib/renderers/THREERenderer.js";

import * as scene from "./scenes/HMR2.js";
import * as scene2 from "./scenes/HMR1.js";

let renderer = initRenderer();

</script>

<Stage renderer={renderer} scene={scene}></Stage>
<Stage renderer={renderer} scene={scene2}></Stage>

<style>
:global(html) {
    margin: 0;
    padding: 0;
    height: 100%;
}
:global(body) {
    margin: 0;
    padding: 0;
    background-color: black;
    height: 100%;
    overflow: hidden;
    display: grid;
    place-items: center;
}
</style>
