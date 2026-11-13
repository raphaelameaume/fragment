import p5 from 'p5';

/**
 * @typedef {object} MountParamsP5Renderer
 * @property {HTMLCanvasElement} canvas
 * @property {p5} p
 */

/**
 * @typedef {import('../state/rendering.svelte').PreviewParamsRenderer & MountParamsP5Renderer} PreviewParamsP5Renderer
 */

/**
 * @typedef {object} PreviewP5Renderer
 * @property {number} id
 * @property {p5} p
 */

/** @type {PreviewP5Renderer[]} */
let previews = [];

/**
 * @param {import('../state/rendering.svelte').PreviewParamsRenderer} params
 * @returns {MountParamsP5Renderer}
 */
export let onMountPreview = ({
	id,
	container,
	canvas,
	width,
	height,
	pixelRatio,
}) => {
	const p = new p5((sketch) => {
		sketch.setup = () => {
			const dpr = window.devicePixelRatio;
			sketch.pixelDensity(pixelRatio);
			sketch.createCanvas(
				(width / dpr) * pixelRatio,
				(height / dpr) * pixelRatio,
				canvas,
			);
		};
	}, container);

	previews.push({
		id,
		p,
	});

	return {
		canvas,
		p,
	};
};

/**
 * @param {{ id: number }} params
 */
export let onBeforeUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.p.resetMatrix();
	}
};

/**
 * @param {PreviewParamsP5Renderer} params
 */
export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.p.pixelDensity(pixelRatio);
		preview.p.resizeCanvas(width, height, false);
	}
};

/**
 * @param {{ id: number }} params
 */
export let onDestroyPreview = ({ id }) => {
	const previewIndex = previews.findIndex((p) => p.id === id);
	const preview = previews[previewIndex];

	if (preview) {
		preview.p.remove();
	}

	previews.splice(previewIndex, 1);
};
