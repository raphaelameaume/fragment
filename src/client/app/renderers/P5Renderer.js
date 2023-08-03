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

export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.p.resizeCanvas(width * pixelRatio, height * pixelRatio, false);
	}
};

export let onDestroyPreview = ({ id }) => {
	const previewIndex = previews.find((p) => p.id === id);
	const preview = previews[previewIndex];

	if (preview) {
		preview.p.remove();
	}

	previews.splice(previewIndex, 1);
};
