/**
 * @typedef {object} MountParams2DRenderer
 * @property {HTMLCanvasElement} canvas
 * @property {CanvasRenderingContext2D} context
 */

/**
 * @typedef {object} PreviewParams
 * @property {number} id
 * @property {HTMLCanvasElement} canvas
 * @property {HTMLElement} container
 * @property {number} width
 * @property {number} height
 * @property {number} pixelRatio
 */

/**
 * @param {PreviewParams} params
 * @returns {MountParams2DRenderer}
 */
export let onMountPreview = ({ canvas }) => {
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error(`Cannot get CanvasRenderingContext2D from canvas`);
	}

	return {
		canvas,
		context,
	};
};

/**
 * @param {MountParams2DRenderer & PreviewParams} params
 */
export let onResizePreview = ({ canvas, width, height, pixelRatio }) => {
	canvas.width = width * pixelRatio;
	canvas.height = height * pixelRatio;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
};
