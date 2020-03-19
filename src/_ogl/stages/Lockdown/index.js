import { Camera, Geometry, Mesh, Program, Texture, Transform, Orbit, Vec2 } from "ogl";

import { Keyboard } from "../../../core/Keyboard";
import { Midi } from "../../../core/Midi";

import { Audio } from "../../../core/Audio.js";
import Message from "./Message";

const vertex = /* glsl */ `
    precision highp float;
    precision highp int;
    attribute vec3 position;
    attribute vec2 speed;
    attribute vec3 normal;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;
    varying vec3 vNormal;
    varying vec2 vUv;

    uniform float uScale;
    uniform float uSize;
    uniform float uForce;


    void main() {
        // vUv = uv;
        vec3 pos = position * 2.0 - 1.0;
        pos.y += uForce * speed.x;

        gl_PointSize = uSize;
        gl_Position = vec4(pos, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;
    precision highp int;

    uniform sampler2D uMap;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
        vec2 uv = gl_PointCoord.xy;
                
        float circle = smoothstep(0.5, 0.4, length(uv - 0.5)) * 0.8;
        
        gl_FragColor.rgb = 0.8 + 0.2 * sin(uv.yxx + 0. + 0.5 * 6.28) + vec3(0.1, 0.0, 0.3);
        gl_FragColor.a = circle;
    }
`;

function Lockdown({ props, renderer }) {
    let { gl } = renderer;
    let uniforms = {
        uScale: { value: 1 },
        uMap: { value: new Texture(gl) },
        uSize: props.particleSize,
        uForce: { value: 0 },
    };

    let scene, camera, mesh, controls;
    let message;
    let state = {
        location: new Vec2(),
        velocity: new Vec2(),
        acceleration: new Vec2(),
        force: 0,
        forceS: 0,
    };

    function init() {
        camera = new Camera(gl);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        camera.position.z = 3;

        scene = new Transform();

        let program = new Program(gl, {
            vertex,
            fragment,
            uniforms: uniforms,
            transparent: true,
            depthTest: false,
        });

        const num = 100;
        const position = new Float32Array(num * 3);
        const random = new Float32Array(num * 4);
        const speeds = new Float32Array(num * 2);

        for (let i = 0; i < num; i++) {
            position.set([Math.random(), Math.random(), Math.random()], i * 3);
            random.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
            speeds.set([Math.random(), Math.random()], i * 2);
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: position },
            random: { size: 4, data: random },
            speed: { size: 2, data: speeds }
        });

        mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });
        // scene.addChild(mesh);

        message = Message(gl, props);
        scene.addChild(message.mesh);
        

        window.addEventListener('click', () => {
            state.force += 0.2;
        });
    }

    function update({ deltaTime }) {
        uniforms.uScale.value = 1 + Audio.volume();

        state.force -= 0.015;
        state.force = Math.max(0, state.force);

        state.forceS += (state.force - state.forceS) * 0.01;

        uniforms.uForce.value = state.forceS;

        // if (props.move.value) {
        //     mesh.rotation.x += 0.001 * props.speed.value * deltaTime;
        //     mesh.rotation.y += 0.001 * props.speed.value * deltaTime;
        //     mesh.rotation.z += 0.001 * props.speed.value * deltaTime;
        // }


        if (controls) {
            controls.update();
        }
    }

    function render({ renderer, gl, target }) {
        gl.clearColor(0, 0, 0, 1);
        renderer.render({ scene, camera, target });
    }

    function resize({ width, height }) {
        camera.perspective({ aspect: width / height });
    }

    function onMount({ container }) {
        if (controls) {
            controls.remove();
        }

        // controls = new Orbit(camera, { element: container });
    }

    function onUnmount() {
        if (controls) {
            controls.remove();
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
    name: 'Lockdown',
    scene: Lockdown,
    props: {
        particleSize: {
            min: 0,
            max: 20,
            value: 10,
        },
        texture: {
            type: "image",
            value: 'assets/images/lockdown.png',
        },
        scale: {
            min: 0,
            max: 10,
            value: 1,
            step: 0.01
        },
        rotateX: {
            min: -Math.PI,
            max: Math.PI,
            value: 0,
        },
        rotateY: {
            min: -Math.PI,
            max: Math.PI,
            value: 0,
        },
        scaleXStart: {
            min: -1,
            max: 4,
            value: 1,
            step: 0.01,
        },
        scaleXEnd: {
            min: -1,
            max: 4,
            value: 1,
            step: 0.01,
        },
        scaleYStart: {
            min: -1,
            max: 4,
            value: 1,
            step: 0.01,
        },
        scaleYEnd: {
            min: -1,
            max: 4,
            value: 1,
            step: 0.01,
        },
    }
};