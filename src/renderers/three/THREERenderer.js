
function THREERenderer(THREE, { width = window.innerWidth * 0.5, height = window.innerHeight * 0.5 } = {}) {
    let dimensions = { width, height };
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    let camera = new THREE.Camera();
    let scene = new THREE.Scene();

    let renderTarget0 = new THREE.WebGLRenderTarget(width, height, {
        format: THREE.RGBFormat,
        stencilBuffer: false,
        depthBuffer: true,
    });

    let renderTarget1 = new THREE.WebGLRenderTarget(width, height, {
        format: THREE.RGBFormat,
        stencilBuffer: false,
        depthBuffer: true,
    });

    let vertices = new Float32Array([
        -1.0, -1.0,
        3.0, -1.0,
        -1.0, 3.0
    ]);

    let uvs = new Float32Array([
        0, 0,
        2, 0,
        0, 2
    ]);

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 2));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    let vertexShader = /* glsl */ `
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
            options: transitions.map(({ name, key }) => ({ key, label: name })),
            onChange: ({ key }) => {
                for (let i = 0; i < transitions.length; i++) {
                    if (transitions[i].key === key) {
                        const { fragment } = transitions[i];

                        mesh.material = new THREE.RawShaderMaterial({
                            vertexShader,
                            fragmentShader: fragment,
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

    let material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader: fragmentFade,
        uniforms,
    })

    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function resize({ width = w, height = h } = {}) {
        dimensions.width = width;
        dimensions.height = height;

        renderer.setSize(width, height);
    }

    function render(stage1, stage2) {
        // render both scenes to target
        if (stage1 && stage1.instance) {
            stage1.instance.update();
            renderer.setRenderTarget(renderTarget0);
            stage1.instance.render({ renderer });
        }

        if (stage2 && stage2.instance) {
            stage2.instance.update();
            renderer.setRenderTarget(renderTarget1);
            stage2.instance.render({ renderer });
        }

        renderer.setRenderTarget(null);

        // save current treshold
        let tempTreshold = uniforms.uTreshold.value;

        // render with only stage 1 visible 
        uniforms.uTreshold.value = 0;
        renderer.render(scene, camera);

        // draw gl context in 2d context
        if (stage1 && stage1.context) {
            stage1.context.clearRect(0, 0, width, height);
            stage1.context.drawImage(renderer.domElement, 0, 0);
        }

        // render with only stage2 visible
        uniforms.uTreshold.value = 1;
        renderer.render(scene, camera);

        // draw gl context in 2d context
        if (stage2 && stage2.context) {
            stage2.context.clearRect(0, 0, width, height);
            stage2.context.drawImage(renderer.domElement, 0, 0);
        }

        // restore treshold value
        uniforms.uTreshold.value = tempTreshold;

        // render output
        renderer.render(scene, camera);
    }

    resize({ width, height });

    return {
        renderer,
        canvas: renderer.domElement,
        resize,
        dimensions,
        render,
        props,
    };
};

export default THREERenderer;