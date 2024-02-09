export let props = {
	background: {
		value: '#0057B8',
	},
	fill: {
		value: 'rgba(255, 215, 0, 1)',
	},
	size: {
		value: 256,
		params: {
			min: 64,
			max: 512,
		},
	},
	shape: {
		value: 'circle',
		params: {
			options: ['circle', 'square'],
		},
	},
};

export let fps = 0;

export let update = ({ context, width, height }) => {
	// draw background
	context.fillStyle = props.background.value;
	context.fillRect(0, 0, width, height);

	// draw circle
	const shape = props.shape.value;
	const size = props.size.value;

	context.fillStyle = props.fill.value;

	if (shape === 'circle') {
		context.beginPath();
		context.arc(width * 0.5, height * 0.5, size, 0, 2 * Math.PI, false);
		context.fill();
	} else if (shape === 'square') {
		context.fillRect(
			width * 0.5 - size,
			height * 0.5 - size,
			size * 2,
			size * 2,
		);
	}
};

export let rendering = '2d';
