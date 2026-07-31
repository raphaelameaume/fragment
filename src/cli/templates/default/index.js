let resolution = { x: 0, y: 0 };

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
	const w = width * pixelRatio;
	const h = height * pixelRatio;

	context.fillStyle = 'rgb(0, 255, 0)';
	context.fillRect(0, 0, w, h);
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export const resize = ({ width, height, pixelRatio }) => {
	resolution.x = width * pixelRatio;
	resolution.y = height * pixelRatio;
};

export const rendering = '2d';
