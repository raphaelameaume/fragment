export const props = {};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {CanvasRenderingContext2D} params.context
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export const init = ({ canvas, context, width, height }) => {};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {CanvasRenderingContext2D} params.context
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @param {number} params.time
 * @param {number} params.deltaTime
 * @param {number} params.frame
 * @param {number} params.playhead
 * @param {number} params.playcount
 */
export const update = ({ context, width, height, pixelRatio }) => {
	context.fillStyle = 'rgb(0, 255, 0)';
	context.fillRect(0, 0, width * pixelRatio, height * pixelRatio);
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export const resize = ({ width, height }) => {};

export const rendering = '2d';
