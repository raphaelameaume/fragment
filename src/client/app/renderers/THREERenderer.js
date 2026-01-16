import { WebGLRenderer, Scene } from 'three';
import { client } from '@fragment/client';
import { getShaderPath } from '../utils/glsl.utils';
import { clearError } from '../state/errors.svelte';

/**
 * @typedef {object} MountParamsThreeRenderer
 * @property {HTMLCanvasElement} canvas
 * @property {THREE.Scene} scene
 * @property {THREE.WebGLRenderer} renderer
 */

/**
 * @typedef {object} PreviewThreeRenderer
 * @property {number} id
 * @property {THREE.Scene} scene
 * @property {THREE.WebGLrenderer} renderer
 * @property {rendered} boolean
 */

/** @type {PreviewThreeRenderer[]} */
let previews = [];

/**
 * @param {object} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLDivElement} params.container
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @returns {MountParamsThreeRenderer}
 */
export let onMountPreview = ({ id, canvas }) => {
	let renderer = new WebGLRenderer({ antialias: true });

	const render = renderer.render;

	renderer.render = (scene, camera) => {
		handleHotShaderUpdate(scene);

		render.call(renderer, scene, camera);
	};

	let scene = new Scene();

	previews.push({
		id,
		scene,
		renderer,
		rendered: false,
	});

	return {
		scene,
		renderer,
		canvas: renderer.domElement,
	};
};

/**
 * @param {MountParamsThreeRenderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLDivElement} params.container
 */
export let onBeforeUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.rendered = false;
	}
};

/**
 * @param {MountParamsThreeRenderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLDivElement} params.container
 */
export let onAfterUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.rendered = true;
	}

	if (
		previews.every((preview) => preview.rendered) &&
		_shaderUpdates.length > 0
	) {
		clearShaderUpdates();
	}
};

/**
 * @param {MountParamsThreeRenderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		const { renderer } = preview;
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(width, height);
	}
};

/**
 * @param {MountParamsThreeRenderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLElement} params.container
 */
export let onDestroyPreview = ({ id }) => {
	const previewIndex = previews.findIndex((p) => p.id === id);
	const preview = previews[previewIndex];

	if (preview) {
		const { renderer } = preview;
		clearError(renderer.getContext().__uuid);
		renderer.dispose();
		renderer.forceContextLoss();
		previews.splice(previewIndex, 1);
	}
};

/* HOT SHADER RELOADING */
let _shaderUpdates = [];

function handleHotShaderUpdate(scene) {
	if (_shaderUpdates.length > 0) {
		const verifyMaterial = (material) => {
			if (!material) return;

			const { vertexShader = '', fragmentShader = '' } = material;

			Object.keys({ vertexShader, fragmentShader }).forEach((key) => {
				const shader = material[key];
				const shaderPath = getShaderPath(shader);
				const shaderUpdate = _shaderUpdates.find(
					(shaderUpdate) => shaderUpdate.filepath === shaderPath,
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
			});
		};
		scene.traverse((child) => {
			if (child.material) {
				const { material } = child;

				if (Array.isArray(material)) {
					material.forEach((m) => verifyMaterial(m));
				} else {
					verifyMaterial(material);
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
	previews.forEach((preview) => {
		clearError(preview.renderer.getContext().__uuid);
	});

	_shaderUpdates = shaderUpdates;
});
