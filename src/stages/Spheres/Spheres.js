import { Camera, Box, Mesh, Sphere, Program } from "ogl";

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
    void main() {
        vec3 normal = normalize(vNormal);
        float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
        vec3 color = vec3(0.2, 0.8, 1.0);
        gl_FragColor.rgb = color + lighting * 0.1;
        gl_FragColor.a = 1.0;
    }
`;

class Spheres extends Stage {

    constructor(options) {
        super(options);

        this.onChangeCount = this.onChangeCount.bind(this);

        this.props.count.onChange = this.onChangeCount;

        this.camera = new Camera(this.gl);
        this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });
        this.camera.position.z = 3;

        const program = new Program(this.gl, {
            vertex,
            fragment,
        });
        
        const geometry = new Box(this.gl, {
            width: 1,
            height: 1,
            depth: 1
        });

        this.mesh = new Mesh(this.gl, { geometry, program });
        this.scene.addChild(this.mesh);
    }

    onChangeCount({ value }) {
        console.log('onChangeCount', value);
    }

    update() {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
        this.mesh.rotation.z += 0.01;
    }

    render() {
        this.renderer.render({ scene: this.scene, camera: this.camera });
    }
}

export default {
    name: 'Spheres',
    scene: Spheres,
    props: {
        count: {
            min: 0,
            max: 10,
            value: 1,
        }
    }
};