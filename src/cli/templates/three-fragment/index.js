import * as THREE from 'three';

import fragmentShader from './fragment.fs';

let camera;
let uniforms = {
	uResolution: { value: new THREE.Vector2() },
	uTime: { value: 0 },
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
export const init = ({ scene, width, height }) => {
	camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);

	let geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		'position',
		new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3),
	);
	geometry.setAttribute(
		'uv',
		new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2),
	);

	let mesh = new THREE.Mesh(
		geometry,
		new THREE.RawShaderMaterial({
			vertexShader: `
        attribute vec3 position;
        attribute vec2 uv;

        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.);
        }
        `,
			fragmentShader,
			uniforms,
		}),
	);

	scene.add(mesh);
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
export const update = ({ renderer, scene, time, deltaTime }) => {
	uniforms.uTime.value = time;

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
	uniforms.uResolution.value.x = width * pixelRatio;
	uniforms.uResolution.value.y = height * pixelRatio;

	camera.left = -width * 0.5;
	camera.right = width * 0.5;
	camera.top = height * 0.5;
	camera.bottom = -height * 0.5;

	camera.updateProjectionMatrix();
};

export const rendering = 'three';
