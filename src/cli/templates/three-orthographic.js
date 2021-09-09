import * as THREE from "three";

let scene, camera;

export let init = ({ width, height }) => {
    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);
};

export let update = ({ renderer, time, deltaTime }) => {
    renderer.render(scene, camera);
};

export let resize = ({ width, height }) => {
    camera.left = -width * 0.5;
    camera.right = width * 0.5;
    camera.top = height * 0.5;
    camera.bottom = -height * 0.5;

    camera.updateProjectionMatrix();
};
