import { Plane, Program, Transform, Mesh } from "ogl";

const vertex = /* glsl */`
precision highp float;
precision highp int;
attribute vec3 position;
attribute vec3 color;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec2 vUv;
uniform float uTime;
uniform float uTimeOffset;
uniform float uScale;
    
void main() {
    vUv = uv;

    vec3 transformed = position;
    transformed *= uScale + (1. - uScale) * (sin(uTime * 0.001 + uTimeOffset) + 1.) * 0.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragment = /* glsl */`
precision highp float;
precision highp int;

uniform float uScale;
uniform vec3 uDiffuse;
uniform float opacity;
uniform float uTime;
uniform float uTimeOffset;

varying vec2 vUv;

float scaleUv(float v, float scale) {
    float s = 1. / scale;
    float value = v * s - ( s - 1. ) * 0.5;

    return value;
}

vec2 rotateUvs ( vec2 uvs, float angle, vec2 center) {
    vec2 uv = uvs;
    uv -= center;

    mat2 m = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = m * uv;

    uv += center;

    return uv;
}

void main() {
    vec2 uv = vUv;

    float uBorder = 0.1;

    float f = step(uv.x, uBorder);
    f = max(f, step(uv.y, uBorder));
    f = max(f, step(1. - uv.x, uBorder));
    f = max(f, step(1. - uv.y, uBorder));

    float c = (sin(uTimeOffset + uTime * 0.002) + 1.) * 0.5;
    vec3 color = mix(vec3(c), vec3(1.) * opacity, f);

    color *= uDiffuse;

    gl_FragColor = vec4(color, 1.0);
}
`;

function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function Squares (gl, props) {
    let container = new Transform(gl);
    
    let count = { x: 10, y: 5 };
    let size = 0.2;
    let uniforms = {
        uTime: { value: 0 }
    };

    let wall0 = new Transform(gl);
    wall0.position.x = -count.x * size * 0.5;
    container.addChild(wall0);

    let wall1 = new Transform(gl);
    wall1.position.x = count.x * size * 0.5;
    container.addChild(wall1);

    props.squaresRX.onChange = () => {
        container.rotation.x = props.squaresRX.value;
    };

    props.squaresRY.onChange = () => {
        container.rotation.y = props.squaresRY.value;
    };

    props.squaresRZ.onChange = () => {
        container.rotation.z = props.squaresRZ.value;
    };

    props.squaresPX.onChange = () => {
        container.position.x = props.squaresPX.value;
    };

    props.squaresPY.onChange = () => {
        container.position.y = props.squaresPY.value;
    };

    props.squaresPZ.onChange = () => {
        container.position.z = props.squaresPZ.value;
    };

    let planes = [];

    props.squaresSize.onTrigger = () => {
        let s = Math.random() > 0.9 ? 1 : Math.random() * 0.5 + 0.5;

        for (let i = 0; i < planes.length; i++) {
            planes[i].scale.set(s, s, s);
        }
    }

    

    // props.squaresScale.onChange = () => {
    //     container.scale.set(props.squaresScale.value, props.squaresScale.value, props.squaresScale.value);
    // };


    let base = Math.random() * 0.7;
    let interval = () => Math.random() * 0.1 + 0.2;

    function randomColors() {
        base = Math.random() * 0.5;

        for (let i = 0; i < planes.length; i++) {
            let [r, g, b] = randomColor();

            planes[i].program.uniforms.uDiffuse.value[0] = r;
            planes[i].program.uniforms.uDiffuse.value[1] = g;
            planes[i].program.uniforms.uDiffuse.value[2] = b;
        }
    }


    props.squaresColor.onTrigger = randomColors;

    function randomColor() {
        let [r, g, b] = hslToRgb(interval() + base, 1, 0.5);
        return [r/255, g/255, b/255];
    }


    let geometry = new Plane(gl, { width: size, height: size });
    

    for (let i = 0; i < count.x; i++) {
        let x = -count.x * size * 0.5 + i * size;

        for (let j = 0; j < count.y; j++) {
            let y = -count.y * size * 0.5 + j * size;

            let [ r, g, b ] = randomColor();
            
            let program = new Program(gl, {
                vertex,
                fragment,
                culLFace: gl.FRONT_AND_BACK,
                uniforms: {
                    ...uniforms,
                    uScale: { value: Math.random() * 0.9 + 0.1 },
                    uTimeOffset: { value: Math.floor((Math.random() * 5)) * Math.PI * 0.5 },
                    opacity: { value: Math.random() },
                    uDiffuse: { value: [r, g, b ]}
                },
            });

            let mesh0 = new Mesh(gl, { geometry, program });
            mesh0.position.x = x;
            mesh0.position.y = y;
            wall0.addChild(mesh0);

            let mesh1 = new Mesh(gl, { geometry, program });
            mesh1.position.x = x;
            mesh1.position.y = y;
            wall1.addChild(mesh1);

            planes.push(mesh0, mesh1);
        }
    }

    function update({ time }) {
        uniforms.uTime.value = time;


        if (Math.round(time / 1000) % 4 === 0) {
            randomColors();
        }

        for (let i = 0; i < planes.length; i++) {
            let mesh = planes[i];

            // mesh.rotation.z = i * Math.PI * 0.5 + time * 0.001;
        }
    }

    return { container, update };
}

Squares.props = {
    squaresRX: {
        min: -Math.PI,
        max: Math.PI,
        value: 0,
        step: 0.01,
        folder: 'Squares',
    },
    squaresRY: {
        min: -Math.PI,
        max: Math.PI,
        value: 0,
        step: 0.01,
        folder: 'Squares',
    },
    squaresRZ: {
        min: -Math.PI,
        max: Math.PI,
        value: 0,
        step: 0.01,
        folder: 'Squares',
    },
    squaresPX: {
        min: -10,
        max: 10,
        value: 0,
        step: 0.01,
        folder: 'Squares',
    },
    squaresPY: {
        min: -10,
        max: 10,
        value: 0,
        step: 0.01,
        folder: 'Squares',
    },
    squaresPZ: {
        min: -10,
        max: 10,
        value: 0,
        step: 0.01,
        folder: 'Squares',
    },
    squaresScale: {
        min: 0,
        max: 2,
        value: 1,
    },
    squaresSize: {
        type: 'button',
        label: 'randomScale',
    },
    squaresColor: {
        type: 'button',
        label: 'randomColor',
    }
};

export default Squares;