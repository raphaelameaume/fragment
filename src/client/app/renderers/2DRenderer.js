/**
 * @typedef {object} MountParams2DRenderer
 * @property {CanvasRenderingContext2D} context
 */

/**
 * @param {object} params
 * @param {number} params.id
 * @param {HTMLDivElement} params.container
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @returns {MountParams2DRenderer}
 */
export let onMountPreview = ({ canvas }) => {
	return {
		context: canvas.getContext('2d'),
	};
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let onResizePreview = ({ canvas, width, height, pixelRatio }) => {
	canvas.width = width * pixelRatio;
	canvas.height = height * pixelRatio;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
};
