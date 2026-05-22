import { WebGLRenderer, Scene } from 'three';
import { client } from '@fragment/client';
import { getShaderPath } from '../utils/glsl.utils';
import { clearError } from '../state/errors.svelte';

/**
 * @typedef {object} MountParamsTHREERenderer
 * @property {HTMLCanvasElement} canvas
 * @property {Scene} scene
 * @property {WebGLRenderer} renderer
 */

/**
 * @typedef {object} PreviewTHREERenderer
 * @property {number} id
 * @property {Scene} scene
 * @property {WebGLRenderer} renderer
 * @property {boolean} rendered
 */

/**
 * @typedef {object} PreviewParams
 * @property {number} id
 * @property {HTMLCanvasElement} canvas
 * @property {HTMLDivElement} container
 * @property {number} width
 * @property {number} height
 * @property {number} pixelRatio
 */

/**
 * @typedef {Object} ShaderWarning
 * @property {string} type - Warning type
 * @property {string} importer - File that imported the shader
 * @property {string} message - Warning message
 * @property {Object} location - Location of the warning
 * @property {string} location.lineText - The line of code with the warning
 */

/**
 * @typedef {Object} ShaderUpdate
 * @property {ShaderWarning[]} [warnings] - Array of shader warnings
 */

/** @type {PreviewTHREERenderer[]} */
let previews = [];

/**
 * @param {PreviewParams} params
 * @returns {MountParamsTHREERenderer}
 */
export let onMountPreview = ({ id }) => {
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
 * @param {PreviewParams} params
 */
export let onBeforeUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.rendered = false;
	}
};

/**
 * @param {PreviewParams} params
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
 * @param {PreviewParams} params
 */
export let onResizePreview = ({ id, width, height, pixelRatio, canvas }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		const { renderer } = preview;
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(width, height);
	}
};

/**
 * @param {PreviewParams} params
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
/** @type {ShaderUpdate[]} */
let _shaderUpdates = [];

function clearShaderUpdates() {
	_shaderUpdates = [];
}

/**
 * @param {Scene} scene
 */
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

if (import.meta.hot) {
	import.meta.hot.on('sketch-update', () => {
		clearShaderUpdates();
	});
}

client.on(
	'shader-update',
	/**
	 * @param {ShaderUpdate[]} shaderUpdates
	 */
	(shaderUpdates) => {
		previews.forEach((preview) => {
			clearError(preview.renderer.getContext().__uuid);
		});

		_shaderUpdates = shaderUpdates;
	},
);
