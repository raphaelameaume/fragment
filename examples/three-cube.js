import * as THREE from "three";

let camera;
let mesh;

export let init = ({ scene, width, height }) => {
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3());

	mesh = new THREE.Mesh(
		new THREE.BoxBufferGeometry(1, 1, 1),
		new THREE.MeshBasicMaterial({
			color: 0xFF0000,
			wireframe: true,
		})
	)

	scene.add(mesh);
};

export let update = ({ renderer, scene, time, deltaTime }) => {
    renderer.render(scene, camera);
};

export let resize = ({ width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};
