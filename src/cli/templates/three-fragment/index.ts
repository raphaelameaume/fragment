import * as THREE from 'three';

import { Init, Rendering, Resize, Update } from '@fragment/types';

import fragmentShader from './fragment.fs';

let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;
let resolution = new THREE.Vector2();
let uniforms = {
	uResolution: { value: resolution },
	uTime: { value: 0 },
};

export const init: Init<'three'> = () => {
	scene = new THREE.Scene();
	camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		'position',
		new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3),
	);
	geometry.setAttribute(
		'uv',
		new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2),
	);

	const mesh = new THREE.Mesh(
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

export const update: Update<'three'> = ({ renderer, time }) => {
	uniforms.uTime.value = time;

	renderer.render(scene, camera);
};

export const resize: Resize<'three'> = ({ width, height, pixelRatio }) => {
	resolution.x = width * pixelRatio;
	resolution.y = height * pixelRatio;

	camera.left = -width * 0.5;
	camera.right = width * 0.5;
	camera.top = height * 0.5;
	camera.bottom = -height * 0.5;

	camera.updateProjectionMatrix();
};

export const rendering: Rendering = 'three';
