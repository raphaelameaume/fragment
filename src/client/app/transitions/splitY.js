export let name = 'SplitY';
export let props = {};

export let fragmentShader = /* glsl */ `
precision highp float;

uniform float threshold;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;

varying vec2 vUv;

void main() {
    gl_FragColor = mix(texture2D(uSampler0, vUv), texture2D(uSampler1, vUv), step(1. - vUv.y, threshold));
}
`;
