import Room from "./Room.js";
import Hole from "./Hole.js";
import Uniforms from "./Uniforms.js";

let vertexShader = /* glsl */`
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vec3 transformed = position;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
    }`;

let fragmentShader = /* glsl */`
    uniform vec3 roomDiffuse;
    uniform vec4 uvTransform;
    uniform float roomAOIntensity;

    varying vec2 vUv;

    #include <common>

    float mapRange(float value, float low1, float high1, float low2, float high2) {
        return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
    }

    void main() {
        vec2 uv = vec2(
            mapRange(vUv.x, 0., 1., uvTransform.x, uvTransform.y),
            mapRange(vUv.y, 0., 1., uvTransform.z, uvTransform.w)
        );
        vec3 color = roomDiffuse;

        color *= sin(uv.y * PI) * roomAOIntensity + (1. - roomAOIntensity);
        color *= sin(uv.x * PI) * roomAOIntensity + (1. - roomAOIntensity);

        gl_FragColor = vec4(color, 1.0);
    }
`;

function Floor() {
    let transform = new THREE.Object3D();

    let widthBig = (Room.width - Hole.width) * 0.5;
    let depthSmall = (Room.depth - Hole.depth) * 0.5;
    let geometry = new THREE.PlaneBufferGeometry(1, 1);
    geometry.rotateX(-Math.PI * 0.5);

    let uniforms = {
        ...Uniforms.common(),
        roomDiffuse: { value: new THREE.Color(0xFF0000) },
        uvTransform: { value: new THREE.Vector4() }
    };

    let left = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            uvTransform: {
                value: new THREE.Vector4(
                    0,
                    (Room.width - Hole.width - (Room.width - Hole.width) * 0.5) / Room.width,
                    0,
                    1,
                )
            }
        },
        side: THREE.DoubleSide,
    }));
    left.position.x = -widthBig * 0.5 - Hole.width * 0.5;
    left.scale.set(widthBig, 1, Room.depth);
    transform.add(left);

    let right = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            uvTransform: {
                value: new THREE.Vector4(
                    ((Room.width - Hole.width) * 0.5 + Hole.width) / Room.width,
                    1,
                    0,
                    1,
                )
            }
        },
        side: THREE.DoubleSide,
    }));
    right.position.x = widthBig * 0.5 + Hole.width * 0.5;
    right.scale.copy(left.scale);
    transform.add(right);

    let back = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            uvTransform: {
                value: new THREE.Vector4(
                    (Room.width - Hole.width - (Room.width - Hole.width) * 0.5) / Room.width,
                    ((Room.width - Hole.width) * 0.5 + Hole.width) / Room.width,
                    ((Room.depth - Hole.depth) * 0.5 + Hole.depth) / Room.depth,
                    1,
                )
            }
        },
        side: THREE.DoubleSide,
    }));
    back.scale.set(Hole.width, 1, depthSmall);
    back.position.z = -depthSmall * 0.5 - Hole.depth * 0.5;
    transform.add(back);

    let front = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            uvTransform: {
                value: new THREE.Vector4(
                    (Room.width - Hole.width - (Room.width - Hole.width) * 0.5) / Room.width,
                    ((Room.width - Hole.width) * 0.5 + Hole.width) / Room.width,
                    0,
                    (Room.depth - Hole.depth - (Room.depth - Hole.depth) * 0.5) / Room.depth,
                )
            }
        },
        side: THREE.DoubleSide,
    }));
    front.scale.copy(back.scale);
    front.position.z = depthSmall * 0.5 + Hole.depth * 0.5;
    transform.add(front);

    return {
        transform,
    }
}

export default Floor;