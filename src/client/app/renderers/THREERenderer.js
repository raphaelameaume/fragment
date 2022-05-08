import { WebGLRenderer, WebGLRenderTarget, OrthographicCamera, Scene, BufferGeometry, Mesh, RawShaderMaterial, Vector2, Float32BufferAttribute } from "three";
import { Texture, fragment } from "@fragment/lib/gl";
import { client } from "@fragment/client";

let renderer;
let previews = [];
let fragmentShader = /* glsl */`
    precision highp float;
    uniform sampler2D uSampler;
    varying vec2 vUv;

    void main() {
        vec3 mapTexel = texture2D(uSampler, vUv).rgb;
        gl_FragColor = vec4(mapTexel, 1.);
    }
`;

export let init = ({ canvas }) => {
    renderer = new WebGLRenderer({ canvas, antialias: true });

    return {
        renderer,
    };
};

export let onMountPreview = ({ index, canvas, width, height, pixelRatio }) => {
    let { gl, render, resize, uniforms, destroy } = fragment({
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

    previews.push({
        index,
        scene,
        texture,
        render,
        resize,
        destroy,
    });

    return {
        scene,
        renderer,
    };
};

export let onDestroyPreview = ({ index, canvas }) => {
    const previewIndex = previews.findIndex(p => p.index === index);
    const preview = previews[previewIndex];

    if (preview) {
        preview.texture.destroy();
        preview.destroy();
        previews.splice(previewIndex, 1);
    }
};

export let onAfterUpdatePreview = ({ index }) => {
    const preview = previews.find(p => p.index === index);

    if (preview) {
        preview.texture.needsUpdate = true;
        preview.render();
    }
};

export let resize = ({ width, height, pixelRatio }) => {
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    for (let i = 0; i < previews.length; i++) {
        const preview = previews[i];
        preview.resize({ width, height, pixelRatio });
    }
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
