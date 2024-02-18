import * as THREE from 'three';

let camera;

export let init = ({ scene, width, height }) => {
	camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
	camera.position.z = 10;
	camera.lookAt(new THREE.Vector3());
};

export let update = ({ renderer, scene, time, deltaTime }) => {
	renderer.render(scene, camera);
};

export let resize = ({ width, height }) => {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
};

export let rendering = 'three';
