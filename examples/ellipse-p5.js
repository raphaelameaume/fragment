import p5 from 'p5';

export let props = {
	radius: {
		value: 100,
		params: {
			min: 10,
			max: 200,
			step: 1,
		},
	},
};

export let fps = 0;

export let setup = ({ p, width, height }) => {};

export let draw = ({ p, width, height }) => {
	p.background(255, 0, 0);

	const radius = props.radius.value;

	p.ellipse(width * 0.5, height * 0.5, radius, radius);
};

export let rendering = 'p5';
