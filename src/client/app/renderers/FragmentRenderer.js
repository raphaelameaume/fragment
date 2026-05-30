import { fragment } from '../lib/gl';
import { client } from '../client';
import { getShaderPath } from '../utils/glsl.utils';
import { clearError } from '../state/errors.svelte';

/**
 * @typedef {object} MountParamsFragmentRenderer
 * @property {HTMLCanvasElement} canvas
 * @property {Frag} frag
 */

/**
 * @typedef {object} FragFragmentRenderer
 * @property {number} id
 * @property {Frag} frag
 */

/** @type {FragFragmentRenderer[]} */
let frags = [];

/**
 * @param {object} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLDivElement} params.container
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
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
 * @param {MountParamsFragmentRenderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	let { frag } = frags.find((f) => f.id === id);

	frag.resize({ width, height, pixelRatio });
};

/**
 * @param {MountParamsFragmentRenderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLElement} params.container
 */
export let onDestroyPreview = ({ id, canvas }) => {
	let fragIndex = frags.findIndex((f) => f.id === id);
	let { frag } = frags[fragIndex];

	clearError(frag.gl.__uuid);

	frag.destroy();
	frags.splice(fragIndex, 1);
};

client.on('shader-update', (shaderUpdates) => {
	frags.forEach(({ frag }) => clearError(frag.gl.__uuid));

	shaderUpdates.forEach((shaderUpdate) => {
		const { filepath, source } = shaderUpdate;

		const programs = frags.map(({ frag }) => frag.program);

		programs.forEach((program) => {
			const { fragment, vertex } = program;

			const shaders = {
				vertexShader: vertex,
				fragmentShader: fragment,
			};

			Object.keys(shaders).forEach((key) => {
				const shaderPath = getShaderPath(shaders[key]);

				if (shaderPath === filepath) {
					console.log(
						`[fragment-plugin-hsr] hsr update ${shaderPath.replace(
							__CWD__,
							'',
						)}`,
					);
					program[key] = source;
					program.needsUpdate = true;
				}
			});
		});
	});
});
