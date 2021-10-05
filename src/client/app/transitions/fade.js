export let name = "Fade";

export let props = {};

export let fragment = /* glsl */`
precision highp float;

uniform float threshold;

void main() {
    gl_FragColor = mix(vec4(1., 0., 0., 1.), vec4(1., 0., 1., 1.), threshold);
}
`;
