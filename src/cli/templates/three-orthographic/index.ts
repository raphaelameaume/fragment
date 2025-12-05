import * as THREE from 'three';

import { Init, Rendering, Resize, Update } from '@fragment/types';

let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;

export const init: Init<'three'> = ({}) => {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x00ff00);

	camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);
	camera.position.z = 1;
};

export const update: Update<'three'> = ({ renderer }) => {
	renderer.render(scene, camera);
};

export const resize: Resize<'three'> = ({ width, height }) => {
	camera.left = -width * 0.5;
	camera.right = width * 0.5;
	camera.top = height * 0.5;
	camera.bottom = -height * 0.5;

	camera.updateProjectionMatrix();
};

export const rendering: Rendering = 'three';
