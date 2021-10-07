import * as THREE from "three";

let camera;

export let init = ({ scene, width, height }) => {
    camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);
};

export let update = ({ renderer, scene, time, deltaTime }) => {
    renderer.render(scene, camera);
};

export let resize = ({ width, height }) => {
    camera.left = -width * 0.5;
    camera.right = width * 0.5;
    camera.top = height * 0.5;
    camera.bottom = -height * 0.5;

    camera.updateProjectionMatrix();
};
