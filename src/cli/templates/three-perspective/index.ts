import * as THREE from 'three';

import { Init, Rendering, Resize, Update } from '@fragment/types';

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;

export const init: Init<'three'> = ({}) => {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x00ff00);

	camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
	camera.position.z = 10;
	camera.lookAt(new THREE.Vector3());
};

export const update: Update<'three'> = ({ renderer }) => {
	renderer.render(scene, camera);
};

export const resize: Resize<'three'> = ({ width, height }) => {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
};

export const rendering: Rendering = 'three';
