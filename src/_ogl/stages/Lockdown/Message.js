import { Plane, Program, Mesh, Texture, Vec2 } from "ogl";

const vertex = `
precision highp float;
precision highp int;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 uScaleX;

varying vec2 vUv;

void main() {
    vUv = uv;

    vec3 transformed = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}

`;

const fragment = `
precision highp float;
precision highp int;

uniform sampler2D uMap;
uniform vec2 uScaleX;
uniform vec2 uScaleY;

varying vec2 vUv;

float scaleUv(float v, float scale) {
    float s = 1. / scale;
    float value = v * s - ( s - 1. ) * 0.5;

    return value;
}

void main() {
    vec2 uv = vUv;
    // uv.y *= 1. + uScaleX.y * vUv.x;
    uv.y = scaleUv(uv.y, 1. + (uScaleX.y - 1.) * vUv.x);
    uv.y = scaleUv(uv.y, 1. + (uScaleX.x - 1.) * (1. - vUv.x));

    uv.x = scaleUv(uv.x, 1. + (uScaleY.y - 1.) * vUv.x);
    uv.x = scaleUv(uv.x, 1. + (uScaleY.x - 1.) * (1. - vUv.x));

    vec4 mapTexel = texture2D(uMap, uv);
    gl_FragColor = vec4(mapTexel.rgb, 1. * mapTexel.a);

}
`;


function Message(gl, props) {
    let geometry = new Plane(gl, { width: 1, height: 1 });
    let uniforms = {
        uMap: { value: new Texture(gl) },
        uScaleX: { value: new Vec2(props.scaleXStart.value, props.scaleXEnd.value)},
        uScaleY: { value: new Vec2(props.scaleYStart.value, props.scaleYEnd.value) },
    };

    props.scaleXStart.onChange = () => {
        uniforms.uScaleX.value.x = props.scaleXStart.value;
    };
    props.scaleXEnd.onChange = () => {
        uniforms.uScaleX.value.y = props.scaleXEnd.value;
    };

    props.scaleYStart.onChange = () => {
        uniforms.uScaleY.value.x = props.scaleYStart.value;
    };
    props.scaleYEnd.onChange = () => {
        uniforms.uScaleY.value.y = props.scaleYEnd.value;
    };

    let program = new Program(gl, {
        vertex,
        fragment,
        uniforms,
        transparent: true,
    });

    props.texture.onChange = ({ image }) => {
        uniforms.uMap.value.image = image;
    };

    let mesh = new Mesh(gl, { geometry, program });
    mesh.rotation.x = props.rotateX.value;
    mesh.rotation.y = props.rotateY.value;

    props.scale.onChange = () => {
        mesh.scale.set(props.scale.value, props.scale.value, props.scale.value);
    }

    props.rotateX.onChange = () => {
        mesh.rotation.x = props.rotateX.value;
    };

    props.rotateY.onChange = () => {
        mesh.rotation.y = props.rotateY.value;
    };
    // mesh.rotation.x = props.rotateX.value;
    // mesh.rotation.y = props.rotateY.value;

    return {
        mesh
    };
}

export default Message;