<script>
import { onMount } from "svelte";

export let scene;
export let renderer;

let canvas;
let fps = scene.fps;

let initialized = false;

$: {
    console.log("Scene has changed", fps);

    if (initialized) {
        scene.dispose();
    }

    scene.init();
    scene.resize(renderer.domElement.width, renderer.domElement.height);

    initialized = true;
}

let context;

function update() {
    scene.update({ renderer });

    context.drawImage(renderer.domElement, 0, 0, renderer.domElement.width, renderer.domElement.height);

    requestAnimationFrame(update);
}

onMount(() => {
    canvas.width = renderer.domElement.width;
    canvas.height = renderer.domElement.height;

    context = canvas.getContext("2d");

    update();
});

</script>

<canvas bind:this={canvas}></canvas>
