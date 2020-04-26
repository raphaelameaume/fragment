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
uniform vec3 roomDiffuse;
uniform float roomAOIntensity;

varying vec2 vUv;

#include <common>

void main() {
    vec3 color = roomDiffuse;

    color *= sin(vUv.y * PI) * roomAOIntensity + (1. - roomAOIntensity); // vertical gradient
    color *= sin(vUv.x * PI) * roomAOIntensity + (1. - roomAOIntensity);

    gl_FragColor = vec4(color, 1.0);
}
`;

function Ceiling() {
    let transform = new THREE.Object3D();

    let geometry = new THREE.PlaneBufferGeometry(1, 1);
    geometry.rotateX(Math.PI * 0.5);
    let material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            diffuse: { value: new THREE.Color(0xFFFFFF) },
        },
        side: THREE.DoubleSide,
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(Room.width, 1, Room.depth);
    mesh.position.y = Room.height;
    transform.add(mesh);


    // lights
    // THREE.RectAreaLightUniformsLib.init();

    const LIGHT_COUNT = 4;
    const LIGHT_WIDTH = Room.width * 0.5;
    const LIGHT_DEPTH = Room.depth * 0.1;
    const LIGHT_SPACE = LIGHT_DEPTH * 2;

    let lightMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
    });

    const LIGHT_LENGTH = (LIGHT_COUNT * LIGHT_DEPTH + (LIGHT_COUNT - 1) * (LIGHT_SPACE - LIGHT_DEPTH))

    let lights = [];

    for (let i = 0; i < LIGHT_COUNT; i++) {
        let light = new THREE.Mesh(geometry, lightMaterial);
        light.scale.set(LIGHT_WIDTH, 1, LIGHT_DEPTH);
        light.position.y = Room.height - 0.01;
        light.position.z = i * LIGHT_SPACE + LIGHT_DEPTH * 0.5 - LIGHT_LENGTH * 0.5;
        transform.add(light);

        lights.push(light);

        light.deltaVisibility = computeLightDelta();
        light.visibilityPassed = 0;

        // let rectLight = new THREE.RectAreaLight(0xffffff, 1, 10, 10);
        // rectLight.width = LIGHT_WIDTH;
        // rectLight.height = LIGHT_DEPTH;
        // rectLight.position.z = light.position.z;
        // rectLight.position.y = -light.position.y;
        // rectLight.intensity = 10;
        // rectLight.lookAt(new THREE.Vector3(0, 1, rectLight.position.z));
        // transform.add(rectLight);
    }

    function computeLightDelta () {
        return Math.random() * 1000;
    }

    function update({ time, deltaTime }) {
        
        for (let i = 2; i < 3; i++) {
            lights[i].visibilityPassed += deltaTime;

            if (lights[i].visibilityPassed >= lights[i].deltaVisibility) {
                lights[i].visibilityPassed = 0;
                lights[i].deltaVisibility = computeLightDelta();

                lights[i].visible = !lights[i].visible;
            }
        }
    }

    return {
        transform,
        update,
    }
}

export default Ceiling;