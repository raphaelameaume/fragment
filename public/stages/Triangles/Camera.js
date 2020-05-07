function Camera({ aspect } = {}) {
    let transform = new THREE.Object3D();
    let camera = new THREE.PerspectiveCamera(45, aspect, 1, 200);
    camera.position.set(0, 0, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();
    transform.add(camera);

    let speed = 0.0005;

    function update({ deltaTime }) {
    }

    return {
        camera,
        transform,
        update,
    }
}

export default Camera;