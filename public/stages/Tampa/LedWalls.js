import Room from "./Room.js";

const vertexShader = /* glsl */`
    attribute vec3 aOffset;
    attribute vec2 aUv;

    uniform float uScale;

    varying vec2 vUv;

    void main() {
        vUv = uv;

        vec3 transformed = position;
        transformed *= uScale;
        transformed += aOffset;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
    }
`;

const fragmentShader = /* glsl */`
    varying vec2 vUv;

    void main() {
        gl_FragColor = vec4(vec3(vUv.y, 0., 0.), 1.);
    }
`;

function LedWall() {
    let transform = new THREE.Object3D();

    let positions = [];
    let uvs = [];
    let w = Room.width / 40;
    let h = Room.height / 20;

    let size = Math.min(w, h);
    let cx = Room.width / size;
    let cy = Room.height / size;

    for (let i = 0; i < cx; i++) {
        let x = -Room.width * 0.5 + i * size;

        for (let j = 0; j < cy; j++) {
            let y = -Room.height * 0.5 + j * size;

            positions.push(x, y, 0);

            let u = i / cx;
            let v = j / cy;

            uvs.push(u, v);
        }
    }

    let geometry = new THREE.PlaneBufferGeometry(1, 1);
    let instancedGeometry = new THREE.InstancedBufferGeometry().copy(geometry);

    instancedGeometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(positions), 3));

    console.log(size);

    let material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uScale: { value: size },
        }
    });

    let mesh = new THREE.Mesh(instancedGeometry, material);
    transform.add(mesh);

    return {
        transform,
    }
}

function LedWalls() {
    let transform = new THREE.Object3D();

    let wall = LedWall();
    transform.add(wall.transform);


    return {
        transform,
    }
}

export default LedWall;