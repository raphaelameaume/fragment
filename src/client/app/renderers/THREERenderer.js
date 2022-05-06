import { WebGLRenderer, WebGLRenderTarget, OrthographicCamera, Scene, BufferGeometry, Mesh, RawShaderMaterial, Vector2, Float32BufferAttribute } from "three";
import { Texture, fragment } from "@fragment/lib/gl";
import { client } from "@fragment/client";

let renderer, scene, camera, mesh;

let previews = [];
let renderTargets = [];

let uniforms = {
    threshold: { value: 0 },
    uResolution: { value: new Vector2() },
};

let transitionMaterials = {};

let vertexShader = /* glsl */`
    attribute vec4 position;
    attribute vec2 uv;
    varying vec2 vUv;

    void main(){
        vUv = uv;
        gl_Position = position;
    }
`;

let fragmentShader = /* glsl */`
    precision highp float;
    uniform sampler2D uSampler;
    varying vec2 vUv;

    void main() {
        vec3 mapTexel = texture2D(uSampler, vUv).rgb;
        gl_FragColor = vec4(mapTexel, 1.);
    }
`;

export let init = ({ canvas, width, height, pixelRatio }) => {
    renderer = new WebGLRenderer({ canvas, antialias: true });
    scene = new Scene();
    camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderTargets[0] = new WebGLRenderTarget(width * pixelRatio, height * pixelRatio);
    renderTargets[1] = new WebGLRenderTarget(width * pixelRatio, height * pixelRatio);

    uniforms[`uSampler0`] = { value: renderTargets[0].texture };
    uniforms[`uSampler1`] = { value: renderTargets[1].texture };

    let geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
    geometry.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));

    let material = new RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    return {
        renderer,
    };
};

export let onMountPreview = ({ index, canvas }) => {
    let { gl, render, resize, uniforms } = fragment({
        canvas,
        shader: fragmentShader,
        uniforms: {
            uSampler: { value: null, type: "sampler2D" },
        },
    });

    let texture = new Texture(gl, {
        image: renderer.domElement,
    });

    uniforms.uSampler.value = texture;

    let scene = new Scene();

    previews[index] = {
        scene,
        texture,
        render,
        resize,
    };

    return {
        scene,
        renderer,
    };
};

export let onTransitionChange = ({ name, fragmentShader }) => {
    if (!transitionMaterials[name]) {
        transitionMaterials[name] = new RawShaderMaterial({
            vertexShader,
            fragmentShader,
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
    const preview = previews[index];

    uniforms.threshold.value = index === 0 ? 0 : 1;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    preview.texture.needsUpdate = true;
    preview.render();
};

export let resize = ({ width, height, pixelRatio }) => {
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    for (let i = 0; i < previews.length; i++) {
        const preview = previews[i];
        preview.resize({ width, height, pixelRatio });
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

/* HOT SHADER RELOADING */
client.on('shader-update', (data) => {
    const { filepath, source } = data;

    function getShaderPath(shader) {
        const match = shader.match(/<filepath:\/\/(.*)>/);
        
        if (match && match.length > 1) {
            return match[1];
        }

        return null;
    }

    for (let i = 0; i < previews.length; i++) {
        const { scene } = previews[i];

        const materials = [];

        scene.traverse((child) => {
            if (child.isMesh) {
                const { material } = child;

                if (material.isShaderMaterial || material.isRawShaderMaterial) {
                    materials.push(material);
                }
            }
        })

        materials.forEach(material => {
            const { vertexShader, fragmentShader } = material;

            Object.keys({ vertexShader, fragmentShader }).forEach((key) => {
                const shader = material[key];
                const shaderPath = getShaderPath(shader);

                if (shaderPath === filepath) {
                    console.log(`[fragment] HotShaderReload : ${shaderPath.replace(__CWD__, "")}`);
                    material[key] = source;
                    material.needsUpdate = true;
                }
            });
        })
    }
});
