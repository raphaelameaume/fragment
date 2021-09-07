<script>
import { onMount } from "svelte";
import { init as initRenderer } from "./lib/renderers/THREERenderer.js";

import * as scene from "./scenes/HMR2.js";

let params = {};

let renderer;
let sceneUpdate;

let proxyScene;

let s;

const init = () => {
    renderer = initRenderer();
    renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);

    scene.init();
    scene.resize(renderer.domElement.width, renderer.domElement.height);

    sceneUpdate = scene.update;

    console.log(scene);

    s = {
        scene: scene.scene,
        fps: scene.fps,
        init: scene.init,
        update: scene.update,
        resize: scene.resize,
        dispose: scene.dispose,
        copy: function ({ scene, init, update, dispose, resize, fps }) {
            this.scene =  scene;
            this.fps =  fps;
            this.init =  init;
            this.update =  update;
            this.resize =  resize;
            this.dispose =  dispose;
        }
    };

    // s = new Proxy(s, {});

    let update = () => {
        s.update({ renderer });

        requestAnimationFrame(() => {
            update();
        });
    };

    update();
};

onMount(() => init());

if (import.meta.hot) {
    import.meta.hot.accept(["./scenes/HMR2.js"], ([newTest]) => {
        s.dispose();

        s.copy(newTest);
        s.init();
        s.resize(renderer.domElement.width, renderer.domElement.height);
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
