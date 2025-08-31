import * as THREE from 'three';

import { Init, Rendering, Resize, Update } from '@fragment/types';

let camera: THREE.PerspectiveCamera;

export const init: Init<'three'> = ({}) => {
	camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
	camera.position.z = 10;
	camera.lookAt(new THREE.Vector3());
};

export const update: Update<'three'> = ({ renderer, scene }) => {
	renderer.render(scene, camera);
};

export const resize: Resize<'three'> = ({ width, height }) => {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
};

export const rendering: Rendering = 'three';
