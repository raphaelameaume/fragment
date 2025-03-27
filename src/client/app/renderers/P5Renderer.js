import p5 from 'p5';

/**
 * @typedef {object} MountParamsP5Renderer
 * @property {HTMLCanvasElement} canvas
 * @property {p5} p
 */

/**
 * @typedef {object} PreviewP5Renderer
 * @property {number} id
 * @property {p5} p
 */

/** @type {PreviewP5Renderer[]} */
let previews = [];

/**
 * @param {object} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLDivElement} params.container
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @returns {MountParamsP5Renderer}
 */
export let onMountPreview = ({ id, width, height }) => {
	const p = new p5((sketch) => {
		sketch.setup = () => {
			sketch.createCanvas(width, height);
		};
	});

	const preview = {
		id,
		p,
	};

	previews.push(preview);

	return {
		canvas: p.canvas,
		p,
	};
};

/**
 * @param {MountParamsP5Renderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLDivElement} params.container
 */
export let onBeforeUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.p.resetMatrix();
	}
};

/**
 * @param {MountParamsP5Renderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.p.pixelDensity(pixelRatio);
		preview.p.resizeCanvas(width, height, false);
	}
};

/**
 * @param {MountParamsP5Renderer} params
 * @param {number} params.id
 * @param {HTMLCanvasElement} params.canvas
 * @param {HTMLElement} params.container
 */
export let onDestroyPreview = ({ id }) => {
	const previewIndex = previews.findIndex((p) => p.id === id);
	const preview = previews[previewIndex];

	if (preview) {
		preview.p.remove();
	}

	previews.splice(previewIndex, 1);
};
