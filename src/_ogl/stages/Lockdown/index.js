import { Camera, Geometry, Mesh, Program, Texture, Transform, Orbit, Vec2 } from "ogl";

import { Keyboard } from "../../../core/Keyboard";
import { Midi } from "../../../core/Midi";

import { Audio } from "../../../core/Audio.js";
import Message from "./Message";
import Squares from "./Squares";

const vertex = /* glsl */ `
    precision highp float;
    precision highp int;
    attribute vec3 position;
    attribute vec4 random;
    attribute vec2 speed;
    attribute vec3 normal;
    attribute vec3 color;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;
    varying vec3 vNormal;
    varying vec2 vUv;

    uniform float uScale;
    uniform float uSize;
    uniform float uForce;
    uniform float uTime;
    
    varying float vLife;
    varying vec3 vColor;

    void main() {
        vColor = color;

        // vUv = uv;
        vec3 pos = position * 2.0 - 1.0;
        // pos.y += uForce * speed.x;


        float y = mod(pos.y + uTime * 0.0005 * speed.x, 2.5);

        pos.y += -1.5 - pos.y + y;

        vLife = sin(((pos.y + 1.) / 2.) * 3.14);

        gl_PointSize = uSize * random.x;
        gl_Position = vec4(pos, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;
    precision highp int;

    uniform sampler2D uMap;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vLife;
    varying vec3 vColor;

    void main() {
        vec2 uv = gl_PointCoord.xy;
                
        float circle = smoothstep(0.5, 0.4, length(uv - 0.5)) * 0.8;
        
        gl_FragColor.rgb = 0.8 + 0.2 * sin(uv.yxx + 0. + 0.5 * 6.28) + vColor;
        gl_FragColor.rgb = vColor;

        gl_FragColor.a = circle * vLife;
    }
`;

function Lockdown({ props, renderer }) {
    let { gl } = renderer;
    let uniforms = {
        uScale: { value: 1 },
        uMap: { value: new Texture(gl) },
        uSize: props.particleSize,
        uForce: { value: 0 },
        uTime: { value: 0 },
    };

    let scene, camera, mesh, controls;
    let squares;
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

        const num = props.particleCount.max;
        const position = new Float32Array(num * 3);
        const color = new Float32Array(num * 3);
        const random = new Float32Array(num * 4);
        const speeds = new Float32Array(num * 2);

        for (let i = 0; i < num; i++) {
            position.set([Math.random(), Math.random(), Math.random()], i * 3);
            random.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
            speeds.set([Math.random(), Math.random()], i * 2);

            color.set([Math.random(), Math.random(), Math.random()], i * 3);
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: position },
            random: { size: 4, data: random },
            speed: { size: 2, data: speeds },
            color: { size: 3, data: color }
        });

        props.particleCount.onChange = () => {
            geometry.setDrawRange(0, props.particleCount.value)
        }

        mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });
        // scene.addChild(mesh);

        // message = Message(gl, props);
        // message.mesh.position.z += 0.1;
        // scene.addChild(message.mesh);

        squares = Squares(gl, props);
        scene.addChild(squares.container);
        

        window.addEventListener('click', () => {
            state.force += 0.2;
        });
    }

    function update({ time, deltaTime }) {
        uniforms.uTime.value = time;
        uniforms.uScale.value = 1 + Audio.volume();

        state.force -= 0.015;
        state.force = Math.max(0, state.force);

        state.forceS += (state.force - state.forceS) * 0.01;

        uniforms.uForce.value = state.forceS;

        squares.update({ time });

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
        ...Squares.props,
        particleSize: {
            min: 0,
            max: 50,
            value: 10,
        },
        particleCount: {
            min: 0,
            max: 2000,
            value: 100,
            step: 1,
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
        positionX: {
            min: -10,
            max: 10,
            step: 0.01,
            value: 0,
        },
        positionY: {
            min: -10,
            max: 10,
            step: 0.01,
            value: 0,
        },
    }
};