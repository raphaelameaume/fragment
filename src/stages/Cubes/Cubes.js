import { Camera, Box, Mesh, Program, Texture } from "ogl";
import { Keyboard } from "../../core/Keyboard";

import Stage from "../Stage.js";
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

class Cubes extends Stage {

    constructor(options) {
        super(options);

        this.onChangeSpeed = this.onChangeSpeed.bind(this);

        this.props.speed.onChange = this.onChangeSpeed;

        this.camera = new Camera(this.gl);
        this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });
        this.camera.position.z = 3;

        this.uniforms = {
            uScale: { value: 1 },
            uMap: { value: new Texture(this.gl) },
        };

        const program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: this.uniforms,
        });

        const geometry = new Box(this.gl, {
            width: 1,
            height: 1,
            depth: 1
        });

        this.mesh = new Mesh(this.gl, { geometry, program });
        this.scene.addChild(this.mesh);

        this.props.move.onTrigger = () => {
            this.props.move = {...this.props.move, value: !this.props.move.value };

        };

        this.props.texture.onChange = ({ image }) => {
            this.uniforms.uMap.value.image = image;
        };
    }

    onChangeSpeed({ value }) {
        // console.log('onChangeCount', value);
    }

    update() {
        this.uniforms.uScale.value = 1 + Audio.volume();

        if (this.props.move.value) {
            this.mesh.rotation.x += 0.01 * this.props.speed.value;
            this.mesh.rotation.y += 0.01 * this.props.speed.value;
            this.mesh.rotation.z += 0.01 * this.props.speed.value;
        }
    }

    render({ renderer, gl }, target) {
        gl.clearColor(0.65, 0.53, 0.28, 1);
        renderer.render({ scene: this.scene, camera: this.camera, target });
    }
}

export default {
    name: 'Cubes',
    scene: Cubes,
    props: {
        speed: {
            min: 0,
            max: 20,
            value: 1,
        },
        move: {
            value: true,
            triggers: [
                Keyboard.key('m')
            ]
        },
        texture: {
            type: "image",
            value: 'assets/images/render.png',
        },
    }
};