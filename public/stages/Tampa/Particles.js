import random from "canvas-sketch-util/random";

import Room from "./Room.js";
import Uniforms from "./Uniforms.js";

const vertexShader = /* glsl */`

attribute float size;
attribute float speed;
attribute vec3 customColor;

uniform float uTime;

varying vec3 vColor;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

void main() {
    vec3 transformed = position;
    transformed -= vec3(0., position.y, 0.);
    transformed = (rotationMatrix(vec3(0., 1., 0.), uTime * speed) * vec4(transformed, 1.)).xyz;
    transformed += vec3(0., position.y, 0.);

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0 );

    gl_PointSize = size * ( 300.0 / -mvPosition.z );

    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = /* glsl */`
uniform vec3 color;

void main() {
    gl_FragColor = vec4(color, 1.0);
}
`;

function Particles() {
    let transform = new THREE.Object3D();

    let geometry = new THREE.BufferGeometry();
    
    let positions = [];
    let sizes = [];
    let speeds = [];
    let count = 500;

    let minRadius = Math.sqrt(Room.width * Room.width * 0.5 * 0.5 + Room.depth * Room.depth * 0.5 * 0.5);
    let maxRadius = minRadius * 4;
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * 2 * Math.PI;
        let r = random.range(minRadius, maxRadius);
        let x = Math.cos(angle) * r;
        let y = random.range(0, Room.height);
        let z = Math.sin(angle) * r;
        
        positions.push(x, y, z);
        sizes.push(random.range(0.2, 0.5));
        speeds.push(random.range(0.5, 1) * 0.1);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(new Float32Array(speeds), 1));

    let material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            color: { value: new THREE.Color(0xFFFFFF) },
        }
    });

    let mesh = new THREE.Points(geometry, material);
    transform.add(mesh);
    
    return {
        transform,
    };
}

export default Particles;