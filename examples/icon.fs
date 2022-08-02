#version 300 es

precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uShift;

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
    float gridFactor = 40.;
    vec2 smallgrid = vUv * 40.;

    float borderRadius = uRadius;
    float c = 0.;
    c += disc(vUv, borderRadius, vec2(1. - borderRadius, 1. - borderRadius));
    c += disc(vUv, borderRadius, vec2(borderRadius, 1. - borderRadius));
    c += disc(vUv, borderRadius, vec2(borderRadius, borderRadius));
    c += disc(vUv, borderRadius, vec2(1. - borderRadius, borderRadius));

    float q = 0.;
    float qv = min(step(borderRadius, vUv.x), step(vUv.x, 1. - borderRadius));
    float qh = min(step(borderRadius, vUv.y), step(vUv.y, 1. - borderRadius));

    q = max(qh, qv);
    q = clamp(q, 0., 1.);
    c += q; 
    c = clamp(c, 0., 1.);

    float t = 1.;

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
    
    float gradient = 1. - mod(floor(vUv.x * (gridFactor * 2. + 1.)), 2.) > 0. ? 0. : 1.;

    vec2 p0 = vec2(0.5);
    vec2 p1 = p0 + (1. / (gridFactor * 2. + 1.)) * 7. * t;
    vec2 p2 = p0 - (1. / (gridFactor * 2. + 1.)) * 7. * t;

    float r = (1. / gridFactor * 10.) * t;

    float ra1 = disc(vUv, r, p2);
    float ra2 = disc(vUv, r, p0);
    float ra3 = disc(vUv, r, p1);

    ra1 *= gradient;
    ra2 *= (1. - gradient);
    ra3 *= gradient;

    pattern *= 1. - c;
    pattern += 0.9 * (1. - c);

    color += vec3(1., 0., 0.) * ra1;
    color += vec3(0., 1., 0.) * ra2;
    color += vec3(0., 0., 1.) * ra3;

    float alpha = 1.;

    float gx = fract(smallgrid.x);
    float gy = fract(smallgrid.y);

    float gridWidth = 0.03;
    float g = max(step(gx, gridWidth), step(1. - gridWidth, gx));
    g += max(g, max(step(gy, gridWidth), step(1. - gridWidth, gy)));
    g = clamp(g, 0., 1.);

    color += g * vec3(0.1);

    alpha *= c;

    FragColor = vec4(color, alpha);
}
