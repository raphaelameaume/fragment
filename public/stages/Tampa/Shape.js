import Hole from "./Hole.js";

function Shape() {
    let transform = new THREE.Object3D();
    
    let height = Hole.width;
    let geometry = new THREE.BoxGeometry(Hole.width, Hole.depth, Hole.depth);
    let material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
    });
    let mesh = new THREE.Mesh(geometry, material);
    // mesh.position.y = -h * 0.5;
    mesh.position.y = height * 1.5;
    transform.add(mesh);

    function update({ deltaTime }) {
        mesh.rotation.x += deltaTime * 0.001;
        mesh.rotation.y += deltaTime * 0.001;
        mesh.rotation.z += deltaTime * 0.001;
    }

    return {
        transform,
        update,
    }
}

export default Shape;