import { Camera, Box, Mesh, Program, Texture, Transform, Orbit } from "ogl";

import { Keyboard } from "../../core/Keyboard";
import { Midi } from "../../core/Midi";

import { Audio } from "../../core/Audio.js";

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

    uniform sampler2D uMap;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
        vec3 normal = normalize(vNormal);
        float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
        vec3 color = vec3(0.2, 0.8, 1.0);

        vec4 texel = texture2D(uMap, vUv);
        color.rgb *= texel.rgb;

        gl_FragColor.rgb = color + lighting * 0.1;
        gl_FragColor.a = 1.0;
    }
`;

function Cubes({ props, renderer }) {
    let { gl } = renderer;
    let uniforms = {
        uScale: { value: 1 },
        uMap: { value: new Texture(gl) },
    };

    let scene, camera, mesh, controls;

    function init() {
        camera = new Camera(gl);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        camera.position.z = 3;

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

        mesh = new Mesh(gl, { geometry, program });
        scene.addChild(mesh);

        props.texture.onChange = ({ image }) => {
            uniforms.uMap.value.image = image;
        };
    }

    function update({ deltaTime }) {
        uniforms.uScale.value = 1 + Audio.volume();

        if (props.move.value) {
            mesh.rotation.x += 0.001 * props.speed.value * deltaTime;
            mesh.rotation.y += 0.001 * props.speed.value * deltaTime;
            mesh.rotation.z += 0.001 * props.speed.value * deltaTime;
        }

        if (props.texture.needsUpdate) {
            uniforms.uMap.value.needsUpdate = true;
        }

        if (controls) {
            // controls.update();
        }
    }

    function render({ renderer, gl, target }) {
        gl.clearColor(0.65, 0.53, 0.28, 1);
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
    name: 'Cubes',
    scene: Cubes,
    props: {
        speed: {
            min: 0,
            max: 1,
            value: 0.1,
            triggers: [
                Midi.knob(5),
            ]
        },
        move: {
            value: true,
            triggers: [
                Keyboard.key('m'),
                Midi.keydown(32),
            ]
        },
        texture: {
            type: "image",
            value: 'assets/images/render.png',
        },
    }
};