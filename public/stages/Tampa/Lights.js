function Lights () {
    let transform = new THREE.Object3D();

    let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    transform.add(ambientLight);

    return {
        transform,
    };
}

export default Lights;