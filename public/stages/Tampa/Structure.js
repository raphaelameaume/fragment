import Room from "./Room";

function Face({ geometry, material }) {
    let transform = new THREE.Object3D();

    let top = new THREE.Mesh(geometry, material);
    transform.add(top);

    let bottom = new THREE.Mesh(geometry, material);
    transform.add(bottom);

    let left = new THREE.Mesh(geometry, material);
    transform.add(left);

    let right = new THREE.Mesh(geometry, material);
    transform.add(right);


    function setScale(scale) {
        top.scale.x = 1;
        top.scale.y = 0.5 * scale;
        top.position.y = 0.5 - top.scale.y * 0.5;

        bottom.scale.x = 1;
        bottom.scale.y = top.scale.y;
        bottom.position.y = -0.5 + bottom.scale.y * 0.5;

        left.scale.x = top.scale.y * 0.5;
        left.scale.y = 1 - (top.scale.y * 2);
        left.position.x = -0.5 + left.scale.x * 0.5;

        right.scale.x = top.scale.y * 0.5;
        right.scale.y = 1 - (top.scale.y * 2);
        right.position.x = 0.5 - left.scale.x * 0.5;
    }

    setScale(0.1);

    return {
        transform,
        setScale,
    }
}

function Structure() {
    let transform = new THREE.Object3D();

    let geometry = new THREE.PlaneBufferGeometry(1, 1);
    let material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
    });

    let faceFront = Face({ geometry, material });
    faceFront.transform.scale.x = Room.width;
    faceFront.transform.scale.y = Room.height;
    faceFront.transform.position.z = Room.depth * 0.5;
    faceFront.transform.position.y = Room.height * 0.5;
    transform.add(faceFront.transform);

    let faceBack = Face({ geometry, material });
    faceBack.transform.scale.x = Room.width;
    faceBack.transform.scale.y = Room.height;
    faceBack.transform.position.z = -Room.depth * 0.5;
    faceBack.transform.position.y = Room.height * 0.5;
    transform.add(faceBack.transform);

    let faceLeft = Face({ geometry, material });
    faceLeft.transform.scale.x = Room.depth;
    faceLeft.transform.scale.y = Room.height;
    faceLeft.transform.rotation.y = Math.PI * 0.5;
    faceLeft.transform.position.x = -Room.width * 0.5;
    faceLeft.transform.position.y = Room.height * 0.5;
    transform.add(faceLeft.transform);

    let faceRight = Face({ geometry, material });
    faceRight.transform.scale.x = Room.depth;
    faceRight.transform.scale.y = Room.height;
    faceRight.transform.rotation.y = -Math.PI * 0.5;
    faceRight.transform.position.x = Room.width * 0.5;
    faceRight.transform.position.y = Room.height * 0.5;
    transform.add(faceRight.transform);

    let faceTop = Face({ geometry, material });
    faceTop.transform.scale.x = Room.width;
    faceTop.transform.scale.y = Room.depth;
    faceTop.transform.rotation.x = Math.PI * 0.5;
    faceTop.transform.position.x = 0;
    faceTop.transform.position.y = Room.height;
    // transform.add(faceTop.transform);

    let faceBottom = Face({ geometry, material });
    faceBottom.transform.scale.x = Room.width;
    faceBottom.transform.scale.y = Room.depth;
    faceBottom.transform.rotation.x = -Math.PI * 0.5;
    faceBottom.transform.position.x = 0;
    faceBottom.transform.position.y = 0;
    // transform.add(faceBottom.transform);

    return {
        transform
    };
}

export default Structure;