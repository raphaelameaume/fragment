import { fragment } from "../lib/gl";

let frags = [];

export let onMountPreview = ({ canvas, index }) => {
	let frag = fragment({
		canvas,
	});

	frags.push({
		index,
		frag,
	});

	return { frag };
};

export let onDestroyPreview = ({ canvas, index }) => {
	let fragIndex = frags.findIndex(f => f.index === index);
	let { frag } = frags[fragIndex];

	frag.destroy();
	frags.splice(fragIndex, 1);
};
