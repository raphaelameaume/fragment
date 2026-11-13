precision mediump float;

uniform float uTime;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
	vec3 color = vec3(0., 1., 0.);

    gl_FragColor = vec4(color, 1.0);
}
