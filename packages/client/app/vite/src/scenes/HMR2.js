import * as THREE from "three";

export let fps = 13;

let scene, camera, mesh;

export let init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 10;

    let color = 0xFFFFFF;

    mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color, wireframe: true }));
    scene.add(mesh);
};

export let update = ({ renderer }) => {
    mesh.rotation.x += 0.02 * 1;
    mesh.rotation.y += 0.02 * 1;

    renderer.render(scene, camera);
};

export let resize = (width, height) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

export let dispose = () => {
    scene.remove(mesh);
};
