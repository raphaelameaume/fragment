import { WebGLRenderer, Scene } from 'three';
import { client } from '../client';
import { getShaderPath } from '../utils/glsl.utils';
import { clearError } from '../state/errors.svelte';

/**
 * @typedef {object} MountParamsTHREERenderer
 * @property {Scene} scene
 * @property {HTMLCanvasElement} canvas
 * @property {WebGLRenderer} renderer
 */

/**
 * @typedef {import('../state/rendering.svelte').PreviewParamsRenderer & MountParamsTHREERenderer} PreviewParamsTHREERenderer
 */

/**
 * @typedef {object} PreviewTHREERenderer
 * @property {number} id
 * @property {Scene} scene
 * @property {WebGLRenderer} renderer
 * @property {boolean} rendered
 */

/**
 * @typedef {import('three').Material & {
 *   vertexShader?: string,
 *   fragmentShader?: string,
 * }} ShaderLikeMaterial
 */

/** @type {PreviewTHREERenderer[]} */
let previews = [];

/**
 * @param {PreviewParamsTHREERenderer} params
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
 * @param {{id: number}} params
 */
export let onBeforeUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.rendered = false;
	}
};

/**
 * @param {{id: number}} params
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
 * @param {PreviewParamsTHREERenderer} params
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
 * @param {{ id: number }} params
 */
export let onDestroyPreview = ({ id }) => {
	const previewIndex = previews.findIndex((p) => p.id === id);
	const preview = previews[previewIndex];

	if (preview) {
		const { renderer } = preview;
		const context =
			/** @type {import('@fragment/utils/glslErrors').FragmentWebGLRenderingContext} */ (
				renderer.getContext()
			);
		clearError(context.__uuid);
		renderer.dispose();
		renderer.forceContextLoss();
		previews.splice(previewIndex, 1);
	}
};

/* HOT SHADER RELOADING */
/** @type {import('src/cli/plugins/hot-shader-replacement').ShaderUpdate[]} */
let _shaderUpdates = [];

function clearShaderUpdates() {
	_shaderUpdates = [];
}

/**
 * @param {ShaderLikeMaterial|undefined} material
 */
function verifyMaterial(material) {
	if (!material) return;

	/** @type {('vertexShader' | 'fragmentShader')[]} */
	const shaderKeys = ['vertexShader', 'fragmentShader'];

	shaderKeys.forEach((key) => {
		const shader = /** @type {string} */ (material[key]);
		const shaderPath = getShaderPath(shader);
		const shaderUpdate = _shaderUpdates.find(
			(shaderUpdate) => shaderUpdate.filepath === shaderPath,
		);

		if (shaderUpdate && shaderPath) {
			if (__CWD__) {
				console.log(
					`[fragment-plugin-hsr] hsr update ${shaderPath.replace(
						__CWD__,
						'',
					)}`,
				);
			}
			material[key] = shaderUpdate.source;
			material.needsUpdate = true;
		}
	});
}

/**
 * @param {import('three').Object3D<import('three').Object3DEventMap>} scene
 */
function handleHotShaderUpdate(scene) {
	if (_shaderUpdates.length > 0) {
		scene.traverse((child) => {
			if ('material' in child && child.material) {
				const material =
					/** @type {ShaderLikeMaterial|ShaderLikeMaterial[]} */ (
						child.material
					);

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
	 * @param {import('src/cli/plugins/hot-shader-replacement').ShaderUpdate[]} shaderUpdates
	 */
	(shaderUpdates) => {
		previews.forEach((preview) => {
			const context =
				/** @type {import('@fragment/utils/glslErrors').FragmentWebGLRenderingContext} */ (
					preview.renderer.getContext()
				);
			clearError(context.__uuid);
		});

		_shaderUpdates = shaderUpdates;
	},
);
