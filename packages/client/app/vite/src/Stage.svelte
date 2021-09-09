<script>
import { onMount, onDestroy } from "svelte";

export let renderer;
export let scene;

let canvas;
let fps = 60;

let initialized = false;

$: {
    if (initialized) {
        console.log("dispose previous scene");
        scene.dispose();
    }

    scene.init();
    scene.resize(renderer.domElement.width, renderer.domElement.height);
    
    initialized = true;
}

let context;
let _raf;

function update() {
    if (scene) {
        scene.update({ renderer });
        context.drawImage(renderer.domElement, 0, 0, renderer.domElement.width, renderer.domElement.height);
    }

    _raf = requestAnimationFrame(update);
}

onMount(() => {
    console.log("onMount");
    canvas.width = renderer.domElement.width;
    canvas.height = renderer.domElement.height;

    context = canvas.getContext("2d");

    update();
});

onDestroy(() => {
    console.log("onDestroy");
    console.log(_raf);
    cancelAnimationFrame(_raf);
});

</script>

<div>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
select {
    -webkit-appearance: none;
    width: 120px;
}

</style>
