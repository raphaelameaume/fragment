export let fragmentShader = /* glsl */`
uniform sampler2D tInput0;
uniform sampler2D tInput1;

uniform float threshold;

void main() {
    gl_FragColor = vec4(tInput0, tInput1, threshold);
}
`;
