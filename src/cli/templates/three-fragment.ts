import type { Init, Update, Resize, Rendering } from "@fragment/types";
import * as THREE from "three";
import fragmentShader from "./fragment.fs";

let camera: THREE.OrthographicCamera;
let uniforms = {
    uResolution: { value: new THREE.Vector2() },
    uTime: { value: 0 },
};

export let init: Init<"three"> = ({ scene, width, height }) => {
    camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));

    let mesh = new THREE.Mesh(geometry, new THREE.RawShaderMaterial({
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
    }));

    scene.add(mesh);
};

export let update: Update<"three"> = ({ renderer, scene, time, deltaTime }) => {
    uniforms.uTime.value = time;
    renderer.render(scene, camera);
};

export let resize: Resize<"three"> = ({ width, height }) => {
    uniforms.uResolution.value.x = width;
    uniforms.uResolution.value.y = height;

    camera.left = -width * 0.5;
    camera.right = width * 0.5;
    camera.top = height * 0.5;
    camera.bottom = -height * 0.5;

    camera.updateProjectionMatrix();
};

export let rendering: Rendering = "three";
