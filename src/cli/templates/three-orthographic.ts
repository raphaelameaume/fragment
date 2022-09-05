import type { Init, Update, Resize, Rendering } from "@fragment/types";
import * as THREE from "three";

let camera: THREE.OrthographicCamera;

export let init: Init<"three"> = ({ scene, width, height }) => {
  camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);
  camera.position.z = 1;
};

export let update: Update<"three"> = ({ renderer, scene, time, deltaTime }) => {
  renderer.render(scene, camera);
};

export let resize: Resize<"three"> = ({ width, height }) => {
  camera.left = -width * 0.5;
  camera.right = width * 0.5;
  camera.top = height * 0.5;
  camera.bottom = -height * 0.5;

  camera.updateProjectionMatrix();
};

export let rendering: Rendering = "three";
