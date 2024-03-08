export let props = {};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {CanvasRenderingContext2D} params.context
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let init = ({ canvas, context, width, height }) => {};

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
export let update = ({ context, width, height, time, deltaTime }) => {
	context.clearRect(0, 0, width, height);
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let resize = ({ width, height }) => {};

export let rendering = '2d';
