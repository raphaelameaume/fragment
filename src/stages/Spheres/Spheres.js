import { Camera, Mesh, Sphere, Program, Color, Transform } from "ogl";
import { Keyboard } from "../../core/Keyboard";
import { Midi } from "../../core/Midi";

import Stage from "../Stage.js";

const vertex = /* glsl */ `
    precision highp float;
    precision highp int;
    attribute vec3 position;
    attribute vec3 normal;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;
    varying vec3 vNormal;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;
    precision highp int;
    varying vec3 vNormal;

    uniform vec3 diffuse;

    void main() {
        vec3 normal = normalize(vNormal);
        float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
        vec3 color = vec3(0.2, 0.8, 1.0);
        gl_FragColor.rgb = diffuse + lighting * 0.1;
        gl_FragColor.a = 1.0;
    }
`;

function Spheres({ props, renderer }) {
    let gl = renderer.gl;
    let scene, camera, meshes;

    let uniforms = {
        diffuse: { value: new Color(props.diffuse.value) }
    };

    function init() {
        scene = new Transform();

        camera = new Camera(gl);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        camera.position.z = 3;

        let program = new Program(gl, {
            vertex,
            fragment,
            uniforms,
        });

        let geometry = new Sphere(gl, {
            radius: 1,
        });

        meshes = new Transform();
        scene.addChild(meshes);

        for (let i = 0; i < 10; i++) {
            let mesh = new Mesh(gl, { geometry, program });

            mesh.position.x = (Math.random() * 2 - 1) * 4;
            mesh.position.y = (Math.random() * 2 - 1) * 4;
            mesh.position.z = (Math.random() * 2 - 1) * 4;

            meshes.addChild(mesh);
        }


        props.diffuse.onChange = ({ value }) => {
            uniforms.diffuse.value = new Color(value);
        };

        props.color.onTrigger = () => {
            uniforms.diffuse.value.r = Math.random();
            uniforms.diffuse.value.g = Math.random();
            uniforms.diffuse.value.b = Math.random();
        };
    }

    function update() {
        meshes.rotation.x += 0.01 * props.speed.value;
        meshes.rotation.y += 0.01 * props.speed.value;
        meshes.rotation.z += 0.01 * props.speed.value;
    }

    function render({ renderer, gl }, target) {
        gl.clearColor(0.25, 0.25, 0.78, 1);
        renderer.render({ scene, camera, target });
    }

    init();

    return {
        canvas: renderer.canvas,
        update,
        render,
    };
}

export default {
    name: 'Spheres',
    scene: Spheres,
    props: {
        speed: {
            min: 0,
            max: 10,
            value: 1,
            controls: [
                // Midi.knob('1')
            ]
        },
        test: {
            value: "test",
            folder: "Folder",
        },
        diffuse: {
            value: '#1256AA',
            type: "color",
            folder: "Folder",
        },
        color: {
            type: "button",
            label: "Random",
            triggers: [
                Keyboard.key('h'),
                Midi.keydown(38),
            ]
        }
    }
};