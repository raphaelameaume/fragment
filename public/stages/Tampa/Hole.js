import Room from "./Room.js";
import Uniforms from "./Uniforms.js";

let vertexShader = /* glsl */`
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 transformed = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}`;

const fragmentShader = /* glsl */`
uniform vec3 diffuse;

varying vec2 vUv;

#include <common>

void main() {
    vec3 color = diffuse;
    color *= vUv.y; // vertical gradient

    float intensity = 0.2;
    color *= sin(vUv.x * PI) * intensity + (1. - intensity);

    gl_FragColor = vec4(color, 1.0);
}
`;

function Hole() {
    let transform = new THREE.Object3D();
    let geometry = new THREE.PlaneGeometry(Hole.width, Hole.height);
    geometry.translate(0, -Hole.height * 0.5, 0);

    // let material = new THREE.MeshBasicMaterial({
    //     color: 0x00FF00,
    //     // wireframe: true,
    //     side: THREE.BackSide,
    //     // side: THREE.DoubleSide,
    // });

    let material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            diffuse: { value: new THREE.Color(0xFFFFFF) },
        },
        side: THREE.BackSide,
    })

    let meshFront = new THREE.Mesh(geometry, material);
    meshFront.position.z = Hole.depth * 0.5;
    transform.add(meshFront);

    let meshLeft = new THREE.Mesh(geometry, material);
    meshLeft.position.x = -Hole.width * 0.5;
    meshLeft.rotation.y = -Math.PI * 0.5;
    transform.add(meshLeft);

    let meshRight = new THREE.Mesh(geometry, material);
    meshRight.position.x = Hole.width * 0.5;
    meshRight.rotation.y = Math.PI * 0.5;
    transform.add(meshRight);

    let meshBack = new THREE.Mesh(geometry, material);
    meshBack.position.z = -Hole.depth * 0.5;
    meshBack.rotation.y = Math.PI;
    transform.add(meshBack);

    return {
        transform
    };
}

Hole.width = Room.width * 0.2;
Hole.depth = Room.depth * 0.2;
Hole.height = Room.height * 0.75;

export default Hole;