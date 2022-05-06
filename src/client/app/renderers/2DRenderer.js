import { createGeometry, createGLRenderer, createGLTexture, createProgram } from "@fragment/utils/canvas.utils";
import { Renderer, Geometry, Program, Texture } from "@fragment/lib/gl";

let uniforms = {
    threshold: { value: 0, type: "float" },
    uResolution: { value: [0, 0], type: "vec2" },
    uSampler0: { value: null, type: "sampler2D" },
    uSampler1: { value: null, type: "sampler2D" },
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

export let init = ({ canvas, pixelRatio }) => {
    renderer = new Renderer({
        canvas,
        pixelRatio,
    });

    geometry = new Geometry(renderer.gl);

    textures[0] = new Texture(renderer.gl);
    textures[1] = new Texture(renderer.gl);

    uniforms.uSampler0.value = textures[0];
    uniforms.uSampler1.value = textures[1];

    program = new Program(renderer.gl, {
        fragment,
        uniforms,
    });
};

export let onTransitionChange = ({ fragmentShader }) => {
    program = createProgram(renderer.gl, {
        vertex,
        fragment: fragmentShader,
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
    let texture = new Texture(renderer.gl, {
        image: canvas,
    });

    textures.push({ index, texture });

    return {
        context: canvas.getContext("2d"),
    }
};

export let onDestroyPreview = ({ index }) => {
    let textureIndex = textures.findIndex(t => t.index === index);
    let { texture } = textures[textureIndex];

    texture.destroy();
    textures.splice(textureIndex, 1);
};

export let onBeforeUpdatePreview = ({ index, canvas }) => {
    // noop in 2D
};

export let onUpdatePreview = ({ index, canvas }) => {

};

export let onAfterUpdatePreview = ({ index, canvas }) => {
    let { texture } = textures.find(t => t.index === index);
    texture.needsUpdate = true;
};
