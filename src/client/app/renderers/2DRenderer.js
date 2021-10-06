import { createGeometry, createGLRenderer, createGLTexture, createProgram } from "../utils/canvas.utils";

let uniforms = {
    threshold: { value: 0, type: "float" },
    uResolution: { value: [0, 0], type: "vec2" },
};

let textures = [];

let renderer, geometry, program;
let vertex = /* glsl */`
    attribute vec4 position;
    attribute vec2 uv;

    varying vec2 vUv;

    void main(){
        vUv = uv;
        gl_Position = position;
    }
`;

let fragment = /* glsl */`
    precision highp float;

    uniform float threshold;
    uniform sampler2D uSampler0;
    uniform sampler2D uSampler1;
    uniform vec2 uResolution;

    varying vec2 vUv;

    void main() {
        vec2 uv = vec2(0.);

        float aspect = uResolution.y / uResolution.x;

        float division = 12.0;

        float v0 = step(fract(vUv.x * division), 0.5);
        float v1 = step(fract(vUv.x * division + 0.5), 0.5);

        float h0 = step(fract(vUv.y * division * aspect), 0.5);
        float h1 = step(fract(vUv.y * division * aspect + 0.5), 0.5);
        
        float p0 = step(v0 * h1, 0.5);
        float p1 = step(1. - v1 * h0, 0.5);

        vec3 color = vec3(p0 - p1);
        color.rgb += 0.9;

        gl_FragColor = vec4(color, 1.);
    }
`;

let context;

export let init = ({ canvas, pixelRatio }) => {
    renderer = createGLRenderer({
        canvas,
        pixelRatio,
    });

    geometry = createGeometry(renderer.gl, {
        attributes: {
            position: { data: [-1, -1, 3, -1, -1, 3] },
            uv: { data: [0, 0, 2, 0, 0, 2] }
        }
    });

    textures[0] = createGLTexture(renderer.gl);
    textures[1] = createGLTexture(renderer.gl);

    uniforms[`uSampler0`] = { value: textures[0], type: 'sampler2D' };
    uniforms[`uSampler1`] = { value: textures[1], type: 'sampler2D' };

    program = createProgram(renderer.gl, {
        vertex,
        fragment,
        uniforms,
    });
};

export let onTransitionChange = (transition) => {
    program = createProgram(renderer.gl, {
        vertex,
        fragment: transition.fragment,
        uniforms,
    });
};

export let resize = ({ width, height, pixelRatio }) => {
    uniforms.uResolution.value[0] = width;
    uniforms.uResolution.value[1] = height;

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize({ width, height });
};

export let update = ({ threshold }) => {
    uniforms.threshold.value = threshold;
    renderer.render({ geometry, program });
};

export let onMountPreview = ({ index, canvas }) => {
    textures[index].image = canvas;
    textures[index].needsUpdate = true;
};

export let onBeforeUpdatePreview = ({ index, canvas }) => {
    // noop in 2D
};

export let onUpdatePreview = ({ index, canvas }) => {

};

export let onAfterUpdatePreview = ({ index, canvas }) => {
    textures[index].needsUpdate = true;
};
