<script>
import { current as currentRendering } from "../stores/rendering.js";

let node;

</script>

<div class="canvas" bind:this={node}>
    {#if index !== ($currentRendering.monitors - 1)}
        <canvas
            width={$currentRendering.width * $currentRendering.dpr}
            height={$currentRendering.height * $currentRendering.dpr}
            bind:this={canvas}
            style="max-width: 100%; max-height: 100%; background: red;"
            on:mousedown={(event) => checkForTriggersDown(event, selected) }
            on:click={(event) => checkForTriggersClick(event, selected) }
            on:mouseup={(event) => checkForTriggersUp(event, selected) }
            on:mousemove={(event) => checkForTriggersMove(event, selected) }
        ></canvas>
    {/if}
</div>
