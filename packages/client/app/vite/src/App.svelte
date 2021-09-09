<script>
import { onMount, onDestroy } from "svelte";
import Stages from "./Stages.svelte";
import { init as initRenderer } from "./lib/renderers/THREERenderer.js";

let renderer = initRenderer();

let index0 = 0;
let index1 = 1;

onDestroy(() => {
    renderer.dispose();
    renderer.domElement.parentNode.removeChild(renderer.domElement);

    console.log("destroy");
})

</script>

<select bind:value={index0}>
    <option value={0}>1</option>
    <option value={1}>2</option>
</select>
<select bind:value={index1}>
    <option value={0}>1</option>
    <option value={1}>2</option>
</select>
<Stages renderer={renderer} indexFirst={index0} indexSecond={index1}></Stages>



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
