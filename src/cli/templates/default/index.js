export let props = {};

export let init = ({ context, width, height }) => {};

export let update = ({ context, width, height, time, deltaTime }) => {
	context.clearRect(0, 0, width, height);
};

export let resize = ({ width, height }) => {};

export let rendering = '2d';
