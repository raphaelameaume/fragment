export let name = "SplitY";
export let props = {};

export let fragment = /* glsl */`
precision highp float;

uniform float threshold;
varying vec2 vUv;

void main() {
    gl_FragColor = mix(vec4(1., 0., 0., 1.), vec4(1., 0., 1., 1.), step(vUv.y, threshold));
}
`;
