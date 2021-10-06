import { WebGLRenderer, WebGLMultisampleRenderTarget, OrthographicCamera, Scene, BufferGeometry, Mesh, RawShaderMaterial, Vector2, Float32BufferAttribute } from "three";
import { createGeometry, createGLRenderer, createGLTexture, createProgram } from "../utils/canvas.utils";

let renderer, scene, camera, mesh;

let previews = [];
let renderTargets = [];

let uniforms = {
    threshold: { value: 0 },
    uResolution: { value: new Vector2() },
};

let transitionMaterials = {};

let vertex = /* glsl */`
    attribute vec4 position;
    attribute vec2 uv;

    varying vec2 vUv;

    void main(){
        vUv = uv;
        gl_Position = position;
    }
`;

let fragment = /* glsl */`
    precision highp float;

    uniform float threshold;
    uniform sampler2D uSampler;
    uniform vec2 uResolution;

    varying vec2 vUv;

    void main() {
        vec2 uv = vec2(0.);

        float aspect = uResolution.y / uResolution.x;

        float division = 12.0;

        float v0 = step(fract(vUv.x * division), 0.5);
        float v1 = step(fract(vUv.x * division + 0.5), 0.5);

        float h0 = step(fract(vUv.y * division * aspect), 0.5);
        float h1 = step(fract(vUv.y * division * aspect + 0.5), 0.5);
        
        float p0 = step(v0 * h1, 0.5);
        float p1 = step(1. - v1 * h0, 0.5);

        vec3 color = vec3(p0 - p1);
        color.rgb += 0.9;

        gl_FragColor = vec4(color, 1.);
    }
`;

export let init = ({ canvas, width, height, pixelRatio }) => {
    renderer = new WebGLRenderer({ canvas });
    scene = new Scene();
    camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderTargets[0] = new WebGLMultisampleRenderTarget(width * pixelRatio, height * pixelRatio);
    renderTargets[1] = new WebGLMultisampleRenderTarget(width * pixelRatio, height * pixelRatio);

    uniforms[`uSampler0`] = { value: renderTargets[0].texture };
    uniforms[`uSampler1`] = { value: renderTargets[1].texture };

    let geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
    geometry.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));

    let material = new RawShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms
    });

    mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    return {
        renderer,
        update,
    };
};

export let onMountPreview = ({ index, canvas, width, height, pixelRatio }) => {
    let r = createGLRenderer({
        canvas,
        pixelRatio,
    });
    
    let { gl } = r; 

    let geometry = createGeometry(gl, {
        attributes: {
            position: { data: [-1, -1, 3, -1, -1, 3] },
            uv: { data: [0, 0, 2, 0, 0, 2] }
        }
    });

    let texture = createGLTexture(gl, {
        image: renderer.canvas,
    });

    let program = createProgram(gl, {
        vertex,
        fragment,
        uniforms: {
            uSampler: { value: texture, type: "sampler2D" },
        },
    });

    previews[index] = {
        renderer: r,
        geometry,
        program,
        texture,
    };
};

export let onTransitionChange = ({ name, fragment }) => {
    if (!transitionMaterials[name]) {
        transitionMaterials[name] = new RawShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms,
        });
    }

    mesh.material = transitionMaterials[name];
}

export let onBeforeUpdatePreview = ({ index }) => {
    let renderTarget = renderTargets[index];

    if (renderTarget) {
        renderer.setRenderTarget(renderTarget);
    }
};

export let onAfterUpdatePreview = ({ index }) => {
    const { renderer: glRenderer, geometry, program, texture } = previews[index];

    uniforms.threshold.value = index === 0 ? 0 : 1;
    renderer.render(scene, camera);

    texture.needsUpdate = true;

    glRenderer.render({ geometry, program });
};

export let resize = ({ renderer, width, height, pixelRatio }) => {
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    for (let i = 0; i < previews.length; i++) {
        const { renderer: glRenderer } = previews[i];
        
        glRenderer.setPixelRatio(pixelRatio);
        glRenderer.setSize(width, height);
    }

    for (let i = 0; i < renderTargets.length; i++) {
        renderTargets[i].setSize(width * pixelRatio, height * pixelRatio);
    }
};

export let update = ({ threshold }) => {
    uniforms.threshold.value = threshold;

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
};
