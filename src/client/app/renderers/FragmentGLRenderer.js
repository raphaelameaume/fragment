import { fragment } from 'fragment-gl';
import { client } from '../client';
import { getShaderPath } from '../utils/glsl.utils';
import { clearError } from '../state/errors.svelte';

/**
 * @typedef {object} MountParamsFragmentGLRenderer
 * @property {HTMLCanvasElement|undefined} canvas
 * @property {import('fragment-gl').Frag} frag
 */

/**
 * @typedef {import('../state/rendering.svelte').PreviewParamsRenderer & MountParamsFragmentGLRenderer} PreviewParamsFragmentGLRenderer
 */

/**
 * @typedef {object} PreviewFragmentGLRenderer
 * @property {number} id
 * @property {import('fragment-gl').Frag} frag
 */

/** @type {PreviewFragmentGLRenderer[]} */
let frags = [];

/**
 * @param {import('../state/rendering.svelte').PreviewParamsRenderer} params
 * @returns {MountParamsFragmentGLRenderer}
 */
export let onMountPreview = ({ id, canvas }) => {
	let frag = fragment({
		canvas,
	});

	frags.push({
		id,
		frag,
	});

	return { canvas, frag };
};

/**
 * @param {PreviewParamsFragmentGLRenderer} params
 */
export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	let preview = frags.find((f) => f.id === id);

	if (preview) {
		let { frag } = preview;

		frag.resize({ width, height, pixelRatio });
	}
};

/**
 * @param {{ id: number }} params
 */
export let onDestroyPreview = ({ id }) => {
	let fragIndex = frags.findIndex((f) => f.id === id);
	let { frag } = frags[fragIndex];

	let gl =
		/** @type {import('@fragment/utils/glslErrors').FragmentWebGLRenderingContext} */ (
			frag.gl
		);

	clearError(gl.__uuid);

	frag.destroy();
	frags.splice(fragIndex, 1);
};

client.on(
	'shader-update',
	/** @param {import('src/cli/plugins/hot-shader-replacement').ShaderUpdate[]} shaderUpdates */ (
		shaderUpdates,
	) => {
		frags.forEach(({ frag }) => {
			const gl =
				/** @type {import('@fragment/utils/glslErrors').FragmentWebGLRenderingContext} */ (
					frag.gl
				);
			clearError(gl.__uuid);
		});

		shaderUpdates.forEach((shaderUpdate) => {
			const { filepath, source } = shaderUpdate;

			const programs = frags.map(({ frag }) => frag.program);

			programs.forEach((program) => {
				const { fragmentShader, vertexShader } = program;

				const shaders = {
					vertexShader,
					fragmentShader,
				};

				/** @type {(keyof shaders)[]} */
				const shaderKeys = ['vertexShader', 'fragmentShader'];

				shaderKeys.forEach((key) => {
					const shaderPath = getShaderPath(shaders[key]);

					if (shaderPath === filepath) {
						if (__CWD__) {
							console.log(
								`[fragment-plugin-hsr] hsr update ${shaderPath.replace(
									__CWD__,
									'',
								)}`,
							);
						}

						program[key] = source;
						program.needsUpdate = true;
					}
				});
			});
		});
	},
);
