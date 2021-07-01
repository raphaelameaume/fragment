<script>
import { onMount } from "svelte";
import { init as initRenderer } from "../renderers/THREERenderer.js";

import { foo, fps } from "../scenes/HMR2.js";

let params = {
    fps
};

const init = () => {
    foo();

    

    // let renderer = initRenderer();
    // renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);

    // scene.init();
    // scene.resize(renderer.domElement.width, renderer.domElement.height);

    // let sceneUpdate = scene.update;

    let update = () => {
        console.log("fps", params.fps);

        requestAnimationFrame(() => {
            update();
        });
    };

    update();

    
};

onMount(() => init());

if (import.meta.hot) {
    import.meta.hot.accept(["../scenes/HMR2.js"], ([newTest]) => {
        newTest.foo();
        params.fps = newTest.fps;;
        // scene.dispose();

        // module.init();
        // module.resize(renderer.domElement.width, renderer.domElement.height);

        // sceneUpdate = module.update;
    });

    import.meta.hot.on("vite:beforeUpdate", (error) => {
        console.warning("theres an update coming");
    });

    import.meta.hot.on("vite:error", (error) => {
        console.log("theres an error");
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
