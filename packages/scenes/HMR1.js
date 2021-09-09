import * as THREE from "three";

export let fps = 10;

export let scene;
let camera, mesh;

export let init = () => {
    console.log("1 init");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 20;

    let color = 0xFFFFFF;

    mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color, wireframe: true }));
    scene.add(mesh);
    
    for (let i = 0; i < 40; i++) {
        let m = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color: Math.random() * 0xFFFFFF, wireframe: true }));
        m.position.set((Math.random() * 2 - 1) * 20, (Math.random() * 2 - 1) * 20, (Math.random() * 2 - 1) * 20);
        scene.add(m);
    }
};

export let update = ({ renderer }) => {
    mesh.rotation.x -= 0.02 * 1;
    mesh.rotation.y -= 0.02 * 1;

    renderer.render(scene, camera);
};

export let resize = (width, height) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

export let dispose = () => {
    scene.remove(mesh);
};
