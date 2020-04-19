import Hole from "./Hole.js";
import Uniforms from "./Uniforms.js";

let vertexShader = /* glsl */`
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 transformed = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}`;

const fragmentShader = /* glsl */`
uniform vec3 roomDiffuse;
uniform float roomAOIntensity;

varying vec2 vUv;

#include <common>

void main() {
    vec3 color = roomDiffuse;

    float intensity = roomAOIntensity;
    intensity *= 0.2;

    float aox = sin(vUv.x * PI) * intensity + (1. - intensity);
    float aoy = sin(vUv.y * PI) * intensity + (1. - intensity);

    color -= (1. - aox);
    color -= (1. - aoy);
    // color *= aoy;

    gl_FragColor = vec4(color, 1.0);
}
`;

function Shape() {
    let transform = new THREE.Object3D();
    
    let height = Hole.width;
    let geometry = new THREE.BoxGeometry(Hole.width, Hole.depth, Hole.depth);
    let material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            diffuse: { value: new THREE.Color(0xFFFFFF) },
        }
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