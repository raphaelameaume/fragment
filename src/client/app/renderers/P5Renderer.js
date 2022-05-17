import p5 from "p5";

let previews = [];

export let onMountPreview = ({ index, width, height }) => {
	const p = new p5((sketch) => {
		sketch.setup = () => {
			sketch.createCanvas(width, height);
		}
	});

	const preview = {
		index,
		p,
	};

	previews.push(preview);
	
    return {
		canvas: p.canvas,
		p,
    };
};

export let onResizePreview = ({ index, width, height, pixelRatio }) => {
	const preview = previews.find(p => p.index === index);

	if (preview) {
		preview.p.resizeCanvas(width * pixelRatio, height * pixelRatio, false);
	}
};

export let onDestroyPreview = ({ index }) => {
	const preview = previews.find(p => p.index === index);

	if (preview) {
		preview.p.remove();
	}
};
