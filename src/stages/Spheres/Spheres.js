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

class Spheres extends Stage {

    constructor(options) {
        super(options);

        this.onChangeCount = this.onChangeCount.bind(this);

        // this.props.count.onChange = this.onChangeCount;

        this.camera = new Camera(this.gl);
        this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });
        this.camera.position.z = 3;

        const uniforms = {
            diffuse: { value: new Color(this.props.diffuse.value) }
        };

        const program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms,
        });
        
        const geometry = new Sphere(this.gl, {
            radius: 1,
        });

        this.meshes = new Transform();
        this.scene.addChild(this.meshes);


        for (let i = 0; i < 10; i++) {
            let mesh = new Mesh(this.gl, { geometry, program });

            mesh.position.x = (Math.random() * 2 - 1) * 4;
            mesh.position.y = (Math.random() * 2 - 1) * 4;
            mesh.position.z = (Math.random() * 2 - 1) * 4;

            this.meshes.addChild(mesh);
        }


        this.props.diffuse.onChange = ({ value }) => {
            uniforms.diffuse.value = new Color(value);
        };

        this.props.color.onTrigger = () => {
            uniforms.diffuse.value.r = Math.random();
            uniforms.diffuse.value.g = Math.random();
            uniforms.diffuse.value.b = Math.random();
        };

        Midi.pad(1);
    }

    onChangeCount({ value }) {
        console.log('onChangeCount', value);
    }

    update() {
        this.meshes.rotation.x += 0.01 * this.props.speed.value;
        this.meshes.rotation.y += 0.01 * this.props.speed.value;
        this.meshes.rotation.z += 0.01 * this.props.speed.value;
    }

    render({ renderer, gl }, target) {
        gl.clearColor(0.25, 0.25, 0.78, 1);
        renderer.render({ scene: this.scene, camera: this.camera, target });
    }
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
            ]
        }
    }
};