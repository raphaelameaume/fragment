<script>
import { onMount } from "svelte";
import { init as initRenderer } from "./lib/renderers/THREERenderer.js";

import * as scene from "./scenes/HMR2.js";

let params = {};

let renderer;
let sceneUpdate;

const init = () => {
    renderer = initRenderer();
    renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);

    scene.init();
    scene.resize(renderer.domElement.width, renderer.domElement.height);

    sceneUpdate = scene.update;
  
    let update = () => {
        sceneUpdate({ renderer });

        requestAnimationFrame(() => {
            update();
        });
    };

    update();
};

onMount(() => init());

if (import.meta.hot) {
    import.meta.hot.on("vite:beforeUpdate", () => {
      console.warn("Vite update");
    });

    import.meta.hot.accept(["./scenes/HMR2.js"], ([newTest]) => {
        scene.dispose();

        newTest.init();
        newTest.resize(renderer.domElement.width, renderer.domElement.height);

        sceneUpdate = newTest.update;
    });

}

</script>

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

:global(div) {
    display: none;
}
</style>
