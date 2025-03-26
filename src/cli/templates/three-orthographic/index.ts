import * as THREE from 'three';

import { Init, Rendering, Resize, Update } from '@fragment/types';

let camera: THREE.OrthographicCamera;

export const init: Init<'three'> = ({}) => {
	camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);
	camera.position.z = 1;
};

export const update: Update<'three'> = ({ renderer, scene }) => {
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
