import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Camera from "./Triangles/Camera.js";
import Composition from "./Triangles/Composition.js";
import Uniforms from "./Triangles/Uniforms.js";

function Triangles({ props, renderer }) {
    let scene = new THREE.Scene();
    let camera = Camera({
        aspect: renderer.canvas.width / renderer.canvas.height,
    });

    let controls = new OrbitControls(camera.camera, document.querySelector('.output'));
    controls.target = new THREE.Vector3(0, 0, 0);

    let composition = Composition();
    scene.add(composition.transform);
    
    function update({ time, deltaTime }) {
        Uniforms.update({ time, deltaTime });

        if (controls) {
            controls.update();
        }

        camera.update({ time, deltaTime });
    }

    function render({ renderer }) {
        renderer.setClearColor('#000000', 1);
        renderer.render(scene, camera.camera);
    }

    function resize() {
        console.log('Triangles :: resize');
    }

    return {
        canvas: renderer.canvas,
        update,
        render,
        resize,
    };
}

export default {
    name: 'Triangles',
    scene: Triangles,
    props: {},
};