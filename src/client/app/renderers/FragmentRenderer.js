import { fragment } from '../lib/gl';
import { client } from '../client';
import { getShaderPath } from '../utils/glsl.utils';
import { clearError } from '../state/errors.svelte';

/**
 * @typedef {object} MountParamsFragmentRenderer
 * @property {HTMLCanvasElement|undefined} canvas
 * @property {import('../lib/gl').Frag} frag
 */

/**
 * @typedef {import('../state/rendering.svelte').PreviewParamsRenderer & MountParamsFragmentRenderer} PreviewParamsFragmentRenderer
 */

/**
 * @typedef {object} PreviewFragmentRenderer
 * @property {number} id
 * @property {import('../lib/gl').Frag} frag
 */

/** @type {PreviewFragmentRenderer[]} */
let frags = [];

/**
 * @param {import('../state/rendering.svelte').PreviewParamsRenderer} params
 * @returns {MountParamsFragmentRenderer}
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
 * @param {PreviewParamsFragmentRenderer} params
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
				const { fragment, vertex } = program;

				const shaders = {
					vertexShader: vertex,
					fragmentShader: fragment,
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
