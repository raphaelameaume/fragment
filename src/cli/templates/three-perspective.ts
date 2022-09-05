import type { Init, Update, Resize, Rendering } from "@fragment/types";
import * as THREE from "three";

let camera: THREE.PerspectiveCamera;

export let init: Init<"three"> = ({ scene, width, height }) => {
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3());
};

export let update: Update<"three"> = ({ renderer, scene, time, deltaTime }) => {
    renderer.render(scene, camera);
};

export let resize: Resize<"three"> = ({ width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

export let rendering: Rendering = "three";
