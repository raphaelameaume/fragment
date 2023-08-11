import { WebGLRenderer, Scene } from 'three';
import { Texture, fragment } from '@fragment/lib/gl';
import { client } from '@fragment/client';
import { getShaderPath } from '../utils/glsl.utils';
import { clearError } from '../stores/errors';

let renderer;
let previews = [];
let fragmentShader = /* glsl */ `
    precision highp float;
    uniform sampler2D uSampler;
    varying vec2 vUv;

    void main() {
        vec3 mapTexel = texture2D(uSampler, vUv).rgb;
        gl_FragColor = vec4(mapTexel, 1.);
    }
`;

export let init = ({ canvas }) => {
	renderer = new WebGLRenderer({ antialias: true });

	const render = renderer.render;

	renderer.render = (scene, camera) => {
		handleHotShaderUpdate(scene);

		render.call(renderer, scene, camera);
	};

	return {
		renderer,
	};
};

export let onMountPreview = ({ id, canvas, width, height, pixelRatio }) => {
	let { gl, render, resize, uniforms, destroy } = fragment({
		canvas,
		shader: fragmentShader,
		uniforms: {
			uSampler: { value: null, type: 'sampler2D' },
		},
	});

	let texture = new Texture(gl, {
		image: renderer.domElement,
	});

	uniforms.uSampler.value = texture;

	let scene = new Scene();

	previews.push({
		id,
		scene,
		texture,
		render,
		resize,
		destroy,
		rendered: false,
	});

	return {
		scene,
		renderer,
	};
};

export let onDestroyPreview = ({ id, canvas }) => {
	const previewIndex = previews.findIndex((p) => p.id === id);
	const preview = previews[previewIndex];

	clearError(renderer.getContext().__uuid);

	if (preview) {
		preview.texture.destroy();
		preview.destroy();
		previews.splice(previewIndex, 1);
	}
};

export let onBeforeUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.rendered = false;
	}
};

export let onAfterUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.texture.needsUpdate = true;
		preview.render();
		preview.rendered = true;
	}

	if (
		previews.every((preview) => preview.rendered) &&
		_shaderUpdates.length > 0
	) {
		clearShaderUpdates();
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
let _shaderUpdates = [];

function handleHotShaderUpdate(scene) {
	if (_shaderUpdates.length > 0) {
		scene.traverse((child) => {
			if (child.material) {
				const { material } = child;

				if (material.isShaderMaterial || material.isRawShaderMaterial) {
					const { vertexShader, fragmentShader } = material;

					Object.keys({ vertexShader, fragmentShader }).forEach(
						(key) => {
							const shader = material[key];
							const shaderPath = getShaderPath(shader);
							const shaderUpdate = _shaderUpdates.find(
								(shaderUpdate) =>
									shaderUpdate.filepath === shaderPath,
							);

							if (shaderUpdate) {
								console.log(
									`[fragment-plugin-hsr] hsr update ${shaderPath.replace(
										__CWD__,
										'',
									)}`,
								);
								material[key] = shaderUpdate.source;
								material.needsUpdate = true;
							}
						},
					);
				}
			}
		});
	}
}

function clearShaderUpdates() {
	_shaderUpdates = [];
}

if (import.meta.hot) {
	import.meta.hot.on('sketch-update', (data) => {
		clearShaderUpdates();
	});
}

client.on('shader-update', (shaderUpdates) => {
	clearError(renderer.getContext().__uuid);

	_shaderUpdates = shaderUpdates;
});
