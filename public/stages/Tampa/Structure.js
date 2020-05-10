import { map } from "lemonade-math";
import Room from "./Room";
import Uniforms from "./Uniforms";

const vertexShader = /* glsl */`
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vec3 transformed = position;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
    }
`;

const fragmentShader = /* glsl */`
uniform vec3 roomDiffuse;
uniform float roomAOIntensity;
uniform vec4 uvTransform;
uniform float scale;

varying vec2 vUv;

#include <common>

float mapRange(float value, float low1, float high1, float low2, float high2) {
    return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

void main() {
    vec3 color = roomDiffuse;

    vec2 uv = vec2(
        mapRange(vUv.x, 0., 1., uvTransform.x, uvTransform.y),
        mapRange(vUv.y, 0., 1., uvTransform.z, uvTransform.w)
    );

    color *= sin(uv.y * PI) * roomAOIntensity + (1. - roomAOIntensity); // vertical gradient
    color *= sin(uv.x * PI) * roomAOIntensity + (1. - roomAOIntensity);

    // color = mix(roomDiffuse, color, scale);

    gl_FragColor = vec4(color, 1.0);
}
`;

function Face({ geometry, material }) {
    let transform = new THREE.Object3D();

    let top = new THREE.Mesh(geometry, material.clone());
    top.material.uniforms = {
        ...Uniforms.common(),
        scale: { value: 0 },
        uvTransform: { value: new THREE.Vector4()}
    }
    transform.add(top);

    let bottom = new THREE.Mesh(geometry, material.clone());
    bottom.material.uniforms = {
        ...Uniforms.common(),
        scale: { value: 0 },
        uvTransform: { value: new THREE.Vector4() }
    }
    transform.add(bottom);

    let left = new THREE.Mesh(geometry, material.clone());
    left.material.uniforms = {
        ...Uniforms.common(),
        scale: { value: 0 },
        uvTransform: { value: new THREE.Vector4() }
    }
    transform.add(left);

    let right = new THREE.Mesh(geometry, material.clone());
    right.material.uniforms = {
        ...Uniforms.common(),
        scale: { value: 0 },
        uvTransform: { value: new THREE.Vector4() }
    }
    
    transform.add(right);


    function setScale(scale) {
        top.scale.x = 1;
        top.scale.y = 0.5 * scale;
        top.position.y = 0.5 - top.scale.y * 0.5;
        top.material.uniforms.scale.value = scale;
        top.material.uniforms.uvTransform.value.x = 0;
        top.material.uniforms.uvTransform.value.y = 1;
        top.material.uniforms.uvTransform.value.z = map(top.scale.y, 0.5, 0, 0.5, 1);
        top.material.uniforms.uvTransform.value.w = 1;

        bottom.scale.x = 1;
        bottom.scale.y = 0.5 * scale;
        bottom.position.y = -0.5 + bottom.scale.y * 0.5;
        bottom.material.uniforms.scale.value = scale;
        bottom.material.uniforms.uvTransform.value.x = 0;
        bottom.material.uniforms.uvTransform.value.y = 1;
        bottom.material.uniforms.uvTransform.value.z = 0;
        bottom.material.uniforms.uvTransform.value.w = map(bottom.scale.y, 0, 0.5, 0, 0.5);

        left.scale.x = top.scale.y * 0.5;
        left.scale.y = 1 - (top.scale.y * 2);

        left.position.x = -0.5 + left.scale.x * 0.5;
        left.material.uniforms.scale.value = scale;
        left.material.uniforms.uvTransform.value.x = 0;
        left.material.uniforms.uvTransform.value.y = left.scale.x;
        left.material.uniforms.uvTransform.value.z = bottom.material.uniforms.uvTransform.value.w;
        left.material.uniforms.uvTransform.value.w = top.material.uniforms.uvTransform.value.z;

        right.scale.x = top.scale.y * 0.5;
        right.scale.y = 1 - (top.scale.y * 2);
        right.material.uniforms.scale.value = scale;
        right.material.uniforms.uvTransform.value.x = 1 - right.scale.x;
        right.material.uniforms.uvTransform.value.y = 1;
        right.material.uniforms.uvTransform.value.z = bottom.material.uniforms.uvTransform.value.w;
        right.material.uniforms.uvTransform.value.w = top.material.uniforms.uvTransform.value.z;
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

    material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            uvTransform: { value: new THREE.Vector4() },
        },
        side: THREE.DoubleSide,
    })

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

    let top = Face({ geometry, material });
    top.transform.scale.x = Room.width;
    top.transform.scale.y = Room.depth;
    top.transform.rotation.x = Math.PI * 0.5;
    top.transform.position.x = 0;
    top.transform.position.y = Room.height;
    top.transform.visible = false;
    transform.add(top.transform);

    let bottom = Face({ geometry, material });
    bottom.transform.scale.x = Room.width;
    bottom.transform.scale.y = Room.depth;
    bottom.transform.rotation.x = -Math.PI * 0.5;
    bottom.transform.position.x = 0;
    bottom.transform.position.y = 0;
    bottom.transform.visible = false;
    transform.add(bottom.transform);

    return {
        transform,
        top,
        bottom,
    };
}

export default Structure;