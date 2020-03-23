import { Renderer, RenderTarget, Geometry, Program, Mesh, Vec2 } from "ogl";
import { emit } from "../events";

export default function ({ width = window.innerWidth, height = window.innerHeight, dpr = window.devicePixelRatio } = {}) {
    let dimensions = { width, height };
    let renderer = new Renderer({ dpr, antialias: true });
    let gl = renderer.gl;

    let renderTarget0 = createRenderTarget();
    let renderTarget0Clone = createRenderTarget();
    let renderTarget1 = createRenderTarget();
    let renderTarget1Clone = createRenderTarget();

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

    let stretchUv = /* glsl */`
        uniform vec2 uScaleX;
        uniform vec2 uScaleY;
        uniform float uScale;
        uniform vec2 uOffset;
        uniform float uAngle;

        vec2 rotateUvs ( vec2 uvs, float angle, vec2 center) {
            vec2 uv = uvs;
            uv -= center;

            mat2 m = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            uv = m * uv;

            uv += center;

            return uv;
        }

        float scaleUv(float v, float scale) {
            float s = 1. / scale;
            float value = v * s - ( s - 1. ) * 0.5;

            return value;
        }

        vec2 stretchUv(vec2 uv) {
            vec2 uvs = uv;

            uvs.y = scaleUv(uv.y, 1. + (uScaleX.y - 1.) * uv.x);
            uvs.y = scaleUv(uvs.y, 1. + (uScaleX.x - 1.) * (1. - uv.x));

            uvs.x = scaleUv(uvs.x, 1. + (uScaleY.x - 1.) * (1. - uv.y));
            uvs.x = scaleUv(uvs.x, 1. + (uScaleY.y - 1.) * uv.y);

            uvs = vec2(scaleUv(uvs.x, uScale), scaleUv(uvs.y, uScale));

            uvs.x -= uOffset.x;
            uvs.y -= uOffset.y;

            uvs = rotateUvs(uvs, uAngle, vec2(0.5, 0.5));

            return uvs;
        }
    `;

    let fragmentSplit = /* glsl */`
        precision highp float;

        uniform sampler2D tInput0;
        uniform sampler2D tInput1;
        uniform float uTreshold;

        varying vec2 vUv;
        
        ${stretchUv}

        void main() {
            vec2 uv = stretchUv(vUv);

            vec4 texel0 = texture2D(tInput0, vUv);
            vec4 texel1 = texture2D(tInput1, vUv);
            
            gl_FragColor = mix(texel0, texel1, step(uv.x, uTreshold));
            // gl_FragColor = vec4(0.0, 1., 1., 1.);
        }
    `;

    let fragmentFade = /* glsl */`
        precision highp float;

        uniform sampler2D tInput0;
        uniform sampler2D tInput1;
        uniform float uTreshold;

        varying vec2 vUv;

        ${stretchUv}

        void main() {
            vec2 uv = stretchUv(vUv);

            vec4 texel0 = texture2D(tInput0, uv);
            vec4 texel1 = texture2D(tInput1, uv);
            
            gl_FragColor = mix(texel0, texel1, uTreshold);
            
            gl_FragColor.rgb = uv.x <= 0.001 ? vec3(0.) : gl_FragColor.rgb;
            gl_FragColor.rgb = uv.x >= 0.999 ? vec3(0.) : gl_FragColor.rgb;
            gl_FragColor.rgb = uv.y <= 0.001 ? vec3(0.) : gl_FragColor.rgb;
            gl_FragColor.rgb = uv.y >= 0.999 ? vec3(0.) : gl_FragColor.rgb;
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
            value: 0.5,
            onChange: () => {
                uniforms.uTreshold.value = props.treshold.value;
            }
        },
        transition: {
            type: 'select',
            options: transitions.map(({ name, key }) => ({ key, label: name })),
            onChange: ({ value }) => {
                for (let i = 0; i < transitions.length; i++) {
                    if (transitions[i].key === value) {
                        const { fragment } = transitions[i];

                        mesh.program = new Program(gl, {
                            vertex,
                            fragment,
                            uniforms
                        });
                    }
                }
            }
        },
        scale: {
            min: 0,
            max: 3,
            value: 1,
            step: 0.01,
        },
        scaleXStart: {
            min: 0,
            max: 4,
            value: 1,
            step: 0.01,
        },
        scaleXEnd: {
            min: 0,
            max: 4,
            value: 1,
            step: 0.01,
        },
        scaleYStart: {
            min: 0,
            max: 4,
            value: 1,
            step: 0.01,
        },
        scaleYEnd: {
            min: 0,
            max: 4,
            value: 1,
            step: 0.01,
        },
        offsetX: {
            min: -3,
            max: 3,
            value: 0,
            step: 0.01,
            onChange: () => {
                uniforms.uOffset.value.x = props.offsetX.value;
            }
        },
        offsetY: {
            min: -3,
            max: 3,
            value: 0,
            step: 0.01,
            onChange: () => {
                uniforms.uOffset.value.y = props.offsetY.value;
            }
        },
        uAngle: {
            min: -2 * Math.PI,
            max: 2 * Math.PI,
            value: 0,
            onChange: () => {
                uniforms.uAngle.value = props.uAngle.value;
            }
        }
    };

    props.scale.onChange = () => {
        uniforms.uScale.value = props.scale.value;
    };

    props.scaleXStart.onChange = () => {
        uniforms.uScaleX.value.x = props.scaleXStart.value;
    };
    props.scaleXEnd.onChange = () => {
        uniforms.uScaleX.value.y = props.scaleXEnd.value;
    };

    props.scaleYStart.onChange = () => {
        uniforms.uScaleY.value.x = props.scaleYStart.value;
    };
    props.scaleYEnd.onChange = () => {
        uniforms.uScaleY.value.y = props.scaleYEnd.value;
    };

    let uniforms = {
        tInput0: { value: renderTarget0.texture },
        tInput1: { value: renderTarget1.texture },
        uTreshold: { value: props.treshold.value },
        uScale: { value: props.scale.value },
        uScaleX: { value: new Vec2(props.scaleXStart.value, props.scaleXEnd.value) },
        uScaleY: { value: new Vec2(props.scaleYStart.value, props.scaleYEnd.value) },
        uOffset: { value: new Vec2(props.offsetX.value, props.offsetY.value) },
        uAngle: { value: props.uAngle.value }
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

    function createRenderTarget(w = dimensions.width, h = dimensions.height) {
        let target = new RenderTarget(gl, {
            width: w,
            height: h,
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            minFilter: gl.LINEAR,
            magFilter: gl.LINEAR,
        });
        return target;
    }

    function debug() {
        let canvas = gl.canvas;
        canvas.style.position = 'absolute';
        canvas.style.bottom = 0;
        canvas.style.left = 0;
        canvas.style.zIndex = 999;

        document.body.appendChild(canvas);
    }

    function resize(w = dimensions.width, h = dimensions.height) {
        dimensions.width = w;
        dimensions.height = h;

        renderer.setSize(w, h);
        renderTarget0 = createRenderTarget();
        renderTarget1 = createRenderTarget();

        uniforms.tInput0.value = renderTarget0.texture;
        uniforms.tInput1.value = renderTarget1.texture;
    }

    function render(stage1, stage2, { deltaTime, time, timeOffset }) {
        // render both scenes to target
        if (stage1 && stage1.instance) {
            stage1.instance.update({ deltaTime, time, timeOffset });
            stage1.instance.render({ renderer, gl, target: renderTarget0, deltaTime });
        }

        if (stage2 && stage1.instance) {
            stage2.instance.update({ deltaTime, time, timeOffset });
            stage2.instance.render({ renderer, gl, target: renderTarget1, deltaTime });
        }

        // save current treshold
        let tempTreshold = uniforms.uTreshold.value;

        if (stage1 && stage1.context) {
            // render with only stage 1 visible 
            uniforms.uTreshold.value = 0;
            renderer.render({ scene: mesh });
    
            // draw gl context in 2d context
            stage1.context.clearRect(0, 0, width, height);
            stage1.context.drawImage(gl.canvas, 0, 0, stage1.context.canvas.width, stage1.context.canvas.height);
        }
        
        if (stage2 && stage2.context) {
            // render with only stage2 visible
            uniforms.uTreshold.value = 1;
            renderer.render({ scene: mesh });
    
            // draw gl context in 2d context
            stage2.context.clearRect(0, 0, width, height);
            stage2.context.drawImage(gl.canvas, 0, 0, stage2.context.canvas.width, stage2.context.canvas.height);
        }

        // restore treshold value
        uniforms.uTreshold.value = tempTreshold;

        // render output
        gl.clearColor(1, 0, 1, 1);
        renderer.render({ scene: mesh });
    }

    resize(width, height);

    return {
        renderer,
        canvas: gl.canvas,
        gl,
        dpr,
        resize,
        dimensions,
        render,
        props,
    };
};