import * as THREE from 'three';

/** @type {THREE.Scene} */
let scene;
/** @type {THREE.OrthographicCamera} */
let camera;
/** @type {THREE.Vector2} */
let resolution = new THREE.Vector2();

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {THREE.WebGLRenderer} params.renderer
 * @param {THREE.Scene} params.scene
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export const init = ({ width, height }) => {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x00ff00);

	camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
	camera.position.z = 10;
	camera.lookAt(new THREE.Vector3());
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {THREE.WebGLRenderer} params.renderer
 * @param {THREE.Scene} params.scene
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @param {number} params.time
 * @param {number} params.deltaTime
 * @param {number} params.frame
 * @param {number} params.playhead
 * @param {number} params.playcount
 */
export const update = ({ renderer, time, deltaTime }) => {
	renderer.render(scene, camera);
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {THREE.WebGLRenderer} params.renderer
 * @param {THREE.Scene} params.scene
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export const resize = ({ width, height, pixelRatio }) => {
	resolution.x = width * pixelRatio;
	resolution.y = height * pixelRatio;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();
};

export const rendering = 'three';
