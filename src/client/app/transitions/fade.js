export let name = 'Fade';

export let props = {};

export let fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform float threshold;

varying vec2 vUv;

void main() {
    gl_FragColor = mix(texture2D(uSampler0, vUv), texture2D(uSampler1, vUv), threshold);
}
`;
