function Camera({ aspect, props } = {}) {
    let transform = new THREE.Object3D();
    let camera = new THREE.PerspectiveCamera(props.fov.value, aspect, 1, 200);
    camera.position.set(0, 0, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();
    transform.add(camera);

    let speed = 0.0005;

    props.fov.onChange = () => {
        camera.fov = Math.floor(props.fov.value);

        camera.updateProjectionMatrix();
    }

    function update({ deltaTime }) {
    }

    return {
        camera,
        transform,
        update,
    }
}

export default Camera;