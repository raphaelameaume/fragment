#version 300 es

precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uRadius;

in vec2 vUv;
out vec4 FragColor;

float aastep(float threshold, float value) {
//   #ifdef GL_OES_standard_derivatives
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
//   #else
//     return step(threshold, value);
//   #endif  
}

float disc(vec2 st, float radius) {
    return 1. - aastep(radius, length(st - vec2(0.5)));
}

float disc(vec2 st, float radius, vec2 center) {
    return 1. - aastep(radius, length(st - center));
}

void main() {
    float radius = uRadius;
    float c = 0.;
    c += disc(vUv, radius, vec2(1. - radius, 1. - radius));
    c += disc(vUv, radius, vec2(radius, 1. - radius));
    c += disc(vUv, radius, vec2(radius, radius));
    c += disc(vUv, radius, vec2(1. - radius, radius));

    float q = 0.;
    float qv = min(step(radius, vUv.x), step(vUv.x, 1. - radius));
    float qh = min(step(radius, vUv.y), step(vUv.y, 1. - radius));

    q = max(qh, qv);
    q = clamp(q, 0., 1.);
    c += q; 
    c = clamp(c, 0., 1.);

    vec3 color = vec3(0.);

    vec2 grid = vUv * 41.;
    vec2 uvp = fract(grid);

    float colIndex = floor(grid.x);
    float rowIndex = floor(grid.y);
    float pattern = 0.;

    float c1 = mod(colIndex, 2.) > 0. ? 1. : 0.;
    float c2 = mod(colIndex + 1., 2.) > 0. ? 1. : 0.;
    float r1 = mod(rowIndex, 2.) > 0. ? 1. : 0.;
    float r2 = mod(rowIndex + 1., 2.) > 0. ? 1. : 0.;
    
    pattern = r1 * c1;
    pattern += c2 * r2;
    pattern = 1. - pattern;
    
    // pattern = ;

    // pattern *= step(uvp.y, 0.5);

    float record = disc(vUv, 0.25, vec2(0.5, 0.6));
    // record *= 1. - disc(vUv, 0.05);

    // pause
    float pauseWidth = 0.01;
    float pauseHeight = 0.7;
    float pauseSpace = 0.1;
    float pause = 0.;

    pause = max(pause, step(vUv.x, 0.5 - pauseSpace * 0.5));
    pause = min(pause, step(0.5 - pauseSpace * 0.5 - pauseWidth, vUv.x));
    pause = max(pause, step(1. - vUv.x, 0.5 - pauseSpace * 0.5));
    pause = min(pause, step(0.5 - pauseSpace * 0.5 - pauseWidth, 1. - vUv.x));
    // pause *= record;

    // pattern *= 1. - record;
    // pattern *= 1. - pause;

    // color += vec3(pattern);
    // color += vec3(1., 0., 0.) * (record);

    float gradient = 1. - mod(floor(vUv.x * 61.), 2.) > 0. ? 0. : 1.;
    // gradient *= record;

    float ra1 = disc(vUv, 0.25, vec2(0.4, 0.4));
    float ra2 = disc(vUv, 0.25, vec2(0.5, 0.5));
    float ra3 = disc(vUv, 0.25, vec2(0.6, 0.6));

    ra1 *= gradient;
    ra2 *= (1. - gradient);
    ra3 *= gradient;

    float raU = max(ra1, ra2);
    raU = max(raU, ra3);


    // raU = max(raU, ra2);
    // ra1 -= pattern;
    // ra2 -= pattern;
    // ra3 -= pattern;

    // pattern -= ra1;
    // pattern -= ra2;
    // pattern -= raU;

    pattern *= 1. - c;
    pattern += 0.9 * (1. - c);
    // pattern = clamp(pattern, 0., 1.);

    // color += patter;



    color += vec3(pattern);
    color += vec3(1., 0., 0.) * ra1;
    color += vec3(0., 1., 0.) * ra2;
    color += vec3(0., 0., 1.) * ra3;

    float alpha = 1.;

    vec2 smallgrid = vUv * 40.;

    float gx = fract(smallgrid.x);
    float gy = fract(smallgrid.y);

    float gridWidth = 0.03;
    float g = max(step(gx, gridWidth), step(1. - gridWidth, gx));
    g += max(g, max(step(gy, gridWidth), step(1. - gridWidth, gy)));
    g = clamp(g, 0., 1.);

    color += g * vec3(0.1);

    FragColor = vec4(color, alpha);
}
