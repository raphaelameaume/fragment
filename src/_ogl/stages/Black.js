import { Camera, Box, Mesh, Program, Texture, Transform, Orbit, Color } from "ogl";


import { Audio } from "../../core/Audio.js";
import { clamp } from "../../math/clamp.js";
import random from "../../math/random.js";

const vertex = /* glsl */ `
    precision highp float;
    precision highp int;
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;
    varying vec3 vNormal;
    varying vec2 vUv;

    uniform float uScale;


    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec3 transformed = position;
        transformed *= uScale;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;
    precision highp int;

    uniform vec3 uDiffuse;
    uniform vec3 uDiffuse2;
    uniform float uBorder;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
        vec3 normal = normalize(vNormal);
        float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));


        float f = step(vUv.x, uBorder);
        f = max(f, step(vUv.y, uBorder));
        f = max(f, step(1. - vUv.x, uBorder));
        f = max(f, step(1. - vUv.y, uBorder));

        vec3 color = mix(uDiffuse2, uDiffuse, f);

        gl_FragColor.rgb = color + lighting * 0.1;
        gl_FragColor.a = 1.0;
    }
`;

function Black({ props, renderer }) {
    let { gl } = renderer;
    let uniforms = {
        uScale: { value: 1 },
        uDiffuse: { value: new Color(props.diffuse.value)},
        uDiffuse2: { value: new Color(props.diffuse2.value)},
        uBorder: { value: props.border.value },
    };

    let backgroundColor;
    props.background.onChange = () => {
        backgroundColor = new Color(props.background.value);
    };

    props.diffuse.onChange = () => {
        uniforms.uDiffuse.value = new Color(props.diffuse.value);
    }

    props.diffuse2.onChange = () => {
        uniforms.uDiffuse2.value = new Color(props.diffuse2.value);
    }

    props.color.onTrigger = () => {
        let color = new Color();
        color.r = Math.random();
        color.g = Math.random();
        color.b = Math.random();

        uniforms.uDiffuse.value = color;
    };

    let scene, camera, mesh, controls;

    function init() {
        camera = new Camera(gl);
        camera.perspective({ near: 0.1, aspect: gl.canvas.width / gl.canvas.height });
        camera.position.x = 5;
        camera.position.y = 4;
        camera.position.z = 5;
        
        scene = new Transform();

        let program = new Program(gl, {
            vertex,
            fragment,
            uniforms: uniforms,
        });

        
        const geometry = new Box(gl, {
            width: 1,
            height: 1,
            depth: 1
        });

        let count = 100;

        for (let i = 0; i < count; i++) {
            mesh = new Mesh(gl, { geometry, program });
            mesh.position.x = random.range(-10, 10);
            mesh.position.y = random.range(-10, 10);
            mesh.position.z = random.range(-10, 10);

            let s = random.range(0, 1);
            mesh.scale.x = s;
            mesh.scale.y = s;
            mesh.scale.z = s;

            scene.addChild(mesh);
        }

    }

    function update({ deltaTime, timeOffset }) {
        uniforms.uBorder.value = props.borderMin.value + clamp(Audio.volume(), 0, props.borderMax.value);

        scene.rotation.y = scene.rotation.y + 0.001 * props.speed.value * deltaTime;

        if (controls) {
            controls.update();
        }
    }

    function render({ renderer, gl, target }) {
        gl.clearColor(backgroundColor.r, backgroundColor.g, backgroundColor.b, 1);
        renderer.render({ scene, camera, target });
    }

    function resize({ width, height }) {
        camera.perspective({ aspect: width / height });
    }

    function onMount({ canvas }) {
        if (controls) {
            controls.remove();
            controls = null;
        }

        controls = new Orbit(camera, { element: canvas });
    }

    function onUnmount() {
        if (controls) {
            controls.remove();
            controls = null;
        }
    }

    init();

    return {
        canvas: renderer.canvas,
        update,
        render,
        resize,
        onMount,
        onUnmount,
    };
}

export default {
    name: 'Black',
    scene: Black,
    props: {
        diffuse: {
            type: "color",
            value: "#ffffff",
            folder: "Colors",
        },
        diffuse2: {
            type: "color",
            value: "#000000",
            folder: "Colors",
        },
        background: {
            type: "color",
            value: "#000000",
            folder: "Colors",
        },
        speed: {
            value: 0.5,
            min: 0,
            max: 10,
        },
        border: {
            value: 0.5,
            min: 0, 
            max: 1,
            step: 0.001,
        },
        borderMin: {
            value: 0.02,
            min: 0,
            max: 1,
            step: 0.001,
        },
        borderMax: {
            value: 0.135,
            min: 0,
            max: 1,
            step: 0.001,
        },
        color: {
            type: 'button',
            label: 'random',
            triggers: [
                Audio.beat(0),
            ],
        }
        
    }
};