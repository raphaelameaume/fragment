precision mediump float;

#define PI 3.141592653589793

uniform float uTime;
uniform float uZoomSpeed;
uniform float uZoomScaleMin;
uniform float uZoomScaleMax;

varying vec2 vUv;

// from https://www.shadertoy.com/view/wfsyRX
float dot_noise(vec3 p)
{
    //The golden ratio:
    //https://mini.gmshaders.com/p/phi
    const float phi = 1.618033988;
    //Rotating the golden angle on the vec3(1, phi, phi*phi) axis
    const mat3 gold = mat3(
    -0.571464913, +0.814921382, +0.096597072,
    -0.278044873, -0.303026659, +0.911518454,
    +0.772087367, +0.494042493, +0.399753815);

    //Gyroid with irrational orientations and scales
    return dot(cos(gold * p), sin(phi * p * gold));
    //Ranges from [-3 to +3]
}

// from https://www.shadertoy.com/view/ll2GD3
vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
	float s = uZoomScaleMin + (sin(uTime * 1.) + 1.) * 0.5 * (uZoomScaleMax - uZoomScaleMin);
	vec2 uv = (vUv - 0.5) * 2.;
    uv *= (5. + s);
    float n = dot_noise(vec3(uv.x, uv.y, uTime * 3.));
	vec3 color = pal(n, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20));

    gl_FragColor = vec4(color, 1.0);
}
