import Hole from "./Hole.js";

function Shape() {
    let transform = new THREE.Object3D();
    
    let geometry = new THREE.BoxGeometry(Hole.width, Hole.width, Hole.depth);
    let material = new THREE.MeshBasicMaterial({
        color: 0xFF00FF
    });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -Hole.width * 0.5;
    transform.add(mesh);

    return {
        transform
    }
}

export default Shape;