<script>
import { onMount } from "svelte";
import { init as initRenderer } from "../renderers/THREERenderer.js";

import * as scene from "../scenes/Test.js";

const init = () => {

    let renderer = initRenderer();
    renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);

    scene.init();

    // scene.init();
    scene.resize(renderer.domElement.width, renderer.domElement.height);

    let sceneUpdate = scene.update;

    let update = () => {
        sceneUpdate({ renderer });

        requestAnimationFrame(() => {
            update();
        });
    };

    update();

    if (import.meta.hot) {
        import.meta.hot.accept("../scenes/Test.js", (module) => {
            scene.dispose();

            module.init();
            module.resize(renderer.domElement.width, renderer.domElement.height);

            sceneUpdate = module.update;
        });
    }
};

onMount(() => init());

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
