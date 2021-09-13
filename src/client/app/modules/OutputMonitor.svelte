<script>
import { onMount } from "svelte";
import { current as currentRenderer } from "../stores/rendering.js";
let node;

onMount(() => {
    node.appendChild(canvas);
});

</script>

<div class="container" bind:this={node}>
    <header class="module-header">
        <h2 class="module-header__title">Output Monitor</h2>
    </header>
</div>

<style>

.container {
    width: 100%;
}

</style>
