import * as THREE from "three";

let scene, camera;

export let init = ({ width, height }) => {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3());
};

export let update = ({ renderer, time, deltaTime }) => {
    renderer.render(scene, camera);
};

export let resize = ({ width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};
