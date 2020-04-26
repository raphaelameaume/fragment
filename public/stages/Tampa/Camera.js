import Room from "./Room";

function Camera({ aspect } = {}) {
    let transform = new THREE.Object3D();
    let camera = new THREE.PerspectiveCamera(45, aspect, 6, 80);
    camera.position.set(0, 0, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();
    transform.add(camera);

    let speed = 0.0005;

    function update({ deltaTime }) {
        // transform.rotation.x -= deltaTime * speed;
        // transform.rotation.z -= deltaTime * speed;
        transform.rotation.y -= deltaTime * speed;
    }

    return {
        camera,
        transform,
        update,
    }
}

export default Camera;