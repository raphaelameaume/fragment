import p5 from 'p5';

let previews = [];

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

export let onBeforeUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.p.resetMatrix();
	}
};

export let onResizePreview = ({ p, width, height, pixelRatio }) => {
	p.pixelDensity(pixelRatio);
	p.resizeCanvas(width, height, false);
};

export let onDestroyPreview = ({ id }) => {
	const previewIndex = previews.findIndex((p) => p.id === id);
	const preview = previews[previewIndex];

	if (preview) {
		preview.p.remove();
	}

	previews.splice(previewIndex, 1);
};
