import fragmentShader from './fragment.fs';

let uniforms = {
	uTime: { value: 0, type: 'float' },
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let init = ({ frag }) => {
	frag.uniforms = uniforms;
	frag.shader = fragmentShader;
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @param {number} params.time
 * @param {number} params.deltaTime
 * @param {number} params.frame
 * @param {number} params.playhead
 * @param {number} params.playcount
 */
export let update = ({ frag, deltaTime }) => {
	uniforms.uTime.value += deltaTime;

	frag.render();
};

export let rendering = 'fragment';
