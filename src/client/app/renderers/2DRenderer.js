/**
 * @typedef {object} MountParams2DRenderer
 * @property {HTMLCanvasElement} canvas
 * @property {CanvasRenderingContext2D} context
 */

/**
 * @param {object} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLElement} params.container
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @returns {MountParams2DRenderer}
 */
export let onMountPreview = ({ canvas }) => {
	return {
		canvas,
		context: canvas.getContext('2d'),
	};
};

/**
 * @param {MountParams2DRenderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLElement} params.container
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let onResizePreview = ({ id, canvas, width, height, pixelRatio }) => {
	canvas.width = width * pixelRatio;
	canvas.height = height * pixelRatio;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
};
