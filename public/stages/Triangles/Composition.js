function Composition() {
    let transform = new THREE.Object3D();

    let radius = 1;
    let side = radius * Math.sqrt(3);
    let grid = 32;
    let size = side * grid;
    let positions = [];
    
    for (let i = 0; i < (grid + 1); i++) {
        let x = i / grid * size - size * 0.5;
        for (let j = 0; j < (grid + 1); j++) {
            let y = j / grid * size - size * 0.5;

            positions.push([x, y]);
        }
    }
    
    let geometryPyr = new THREE.ConeBufferGeometry(radius, radius, 3);
    geometryPyr.rotateY(Math.PI);
    geometryPyr.rotateX(Math.PI * 0.5);

    let materialPyr = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        wireframe: true,
    });

    let materialGrid = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
    });

    let geometryGrid = new THREE.PlaneBufferGeometry(side * 0.1, side * 0.1);

    for (let i = 0; i < positions.length; i++) {
        let [ x, y ] = positions[i]; 

        let material = materialGrid;

        if (x === 0 && y === 0) {
            material = new THREE.MeshBasicMaterial({
                color: 0xFF0000
            });
            // material.color = 0xFF0000;
        }

        let mesh = new THREE.Mesh(geometryGrid, material);
        mesh.position.x = x;
        mesh.position.y = y;

        transform.add(mesh);
    }

    let pyramids = [
        // scale 4
        [ side * 2, radius * 2, 4, 0 ],
        [ side * 2, -radius * 2, 4, Math.PI ],
        [0, radius * 4, 4, Math.PI],
        [-side * 2, radius * 2, 4, 0],
        [-side * 4, radius * 4, 4, Math.PI],
        [-side * 4, radius * 8, 4, 0],

        // scale 3
        [side * 3.5, radius * 4.5, 3, Math.PI],
        [0, -radius * 3, 3, 0],
        [0, -radius * 6, 3, Math.PI],
        [-side * 1.5, -radius * 1.5, 3, Math.PI],
        [side * 1.5, -radius * 7.5, 3, 0],
        [side * 1.5, -radius * 10.5, 3, Math.PI],

        // scale 2
        [-side * 3, radius * 11, 2, Math.PI],
    ];

    for (let i = 0; i < pyramids.length; i++) {
        let [ x, y, scale, rotationZ ] = pyramids[i];

        let mesh = new THREE.Mesh(geometryPyr, materialPyr);
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = scale * 0.5;
        mesh.scale.set(scale, scale, scale);
        mesh.rotation.z = rotationZ;

        transform.add(mesh);
    }

    return {
        transform,
    };
}

export default Composition;