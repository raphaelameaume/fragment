import { Renderer, RenderTarget, Geometry, Program, Mesh } from "ogl";
import { emit } from "../events";

export default function ({ width = window.innerWidth * 0.5, height = window.innerHeight * 0.5 } = {}) {
    let dimensions = { width, height };
    let renderer = new Renderer({ dpr: 1 });
    let gl = renderer.gl;

    let renderTarget0 = new RenderTarget(gl, {
        width: 512,
        height: 512,
    });

    let renderTarget1 = new RenderTarget(gl, {
        width: 512,
        height: 512,
    });

    let geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    let vertex = /* glsl */ `
        precision highp float;

        attribute vec2 position;
        attribute vec2 uv;

        varying vec2 vUv;
        void main () {
            vUv = uv;
            gl_Position = vec4(position, 0, 1);
        }
    `;

    let fragmentFade = /* glsl */`
        precision highp float;

        uniform sampler2D tInput0;
        uniform sampler2D tInput1;
        uniform float uTreshold;

        varying vec2 vUv;

        void main() {
            vec4 texel0 = texture2D(tInput0, vUv);
            vec4 texel1 = texture2D(tInput1, vUv);
            
            gl_FragColor = mix(texel0, texel1, uTreshold);
            // gl_FragColor = vec4(0.0, 1., 1., 1.);
        }
    `;

    let fragmentSplit = /* glsl */`
        precision highp float;

        uniform sampler2D tInput0;
        uniform sampler2D tInput1;
        uniform float uTreshold;

        varying vec2 vUv;

        void main() {
            vec4 texel0 = texture2D(tInput0, vUv);
            vec4 texel1 = texture2D(tInput1, vUv);
            
            gl_FragColor = mix(texel0, texel1, step(vUv.x, uTreshold));
            // gl_FragColor = vec4(0.0, 1., 1., 1.);
        }
    `;


    let transitions = [
        { name: 'Fade', key: 'fade', fragment: fragmentFade },
        { name: 'Split V', key: 'split', fragment: fragmentSplit },
    ]

    let props = {
        treshold: {
            min: 0,
            max: 1,
            step: 0.001,
            value: 0,
            onChange: () => {
                uniforms.uTreshold.value = props.treshold.value;
            }
        },
        transition: {
            type: 'select',
            value: transitions.map(({ name, key }) => ({ key, value: name })),
            onChange: ({ key }) => {
                for (let i = 0; i < transitions.length; i++) {
                    if (transitions[i].key === key) {
                        const { fragment } = transitions[i];

                        mesh.program = new Program(gl, {
                            vertex,
                            fragment,
                            uniforms
                        });
                    }
                }
            }
        }
    };

    let uniforms = {
        tInput0: { value: renderTarget0.texture },
        tInput1: { value: renderTarget1.texture },
        uTreshold: { value: props.treshold.value },
    };

    let program = new Program(gl, {
        vertex,
        fragment: fragmentFade,
        uniforms,
    });

    let mesh = new Mesh(gl, {
        geometry,
        program,
    });

    function debug() {
        let canvas = gl.canvas;
        canvas.style.position = 'absolute';
        canvas.style.bottom = 0;
        canvas.style.left = 0;
        canvas.style.zIndex = 999;

        document.body.appendChild(canvas);
    }

    function resize({ width = w, height = h } = {}) {
        dimensions.width = width;
        dimensions.height = height;

        renderer.setSize(width, height);
    }

    function render(stage1, stage2, { deltaTime }) {
        // render both scenes to target
        stage1.instance.update({ deltaTime });
        stage1.instance.render({ renderer, gl, target: renderTarget0, deltaTime });

        stage2.instance.update({ deltaTime });
        stage2.instance.render({ renderer, gl, target: renderTarget1, deltaTime });

        // save current treshold
        let tempTreshold = uniforms.uTreshold.value;

        // render with only stage 1 visible 
        uniforms.uTreshold.value = 0;
        renderer.render({ scene: mesh });

        // draw gl context in 2d context
        stage1.context.clearRect(0, 0, width, height);
        stage1.context.drawImage(gl.canvas, 0, 0);

        // render with only stage2 visible
        uniforms.uTreshold.value = 1;
        renderer.render({ scene: mesh });

        // draw gl context in 2d context
        stage2.context.clearRect(0, 0, width, height);
        stage2.context.drawImage(gl.canvas, 0, 0);

        // restore treshold value
        uniforms.uTreshold.value = tempTreshold;

        // render output
        gl.clearColor(1, 0, 1, 1);
        renderer.render({ scene: mesh });
    }

    resize({ width, height });

    return {
        renderer,
        renderTargets: [renderTarget0, renderTarget1],
        canvas: gl.canvas,
        gl,
        resize,
        dimensions,
        render,
        props,
    };
};