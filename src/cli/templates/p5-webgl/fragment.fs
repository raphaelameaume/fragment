precision mediump float;

#define PI 3.141592653589793

uniform float uTime;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
	vec3 color = vec3(sin(uv.x * PI * 10. + uTime * 10.));
    
    gl_FragColor = vec4(color, 1.0);
}
