export let props = {};

export let init = ({ context, width, height }) => {
};

export let update = ({ context, width, height }) => {
	context.clearRect(0, 0, width, height);
	
	context.fillStyle = '#00FFFF';

	context.fillRect(width * 0.25, height * 0.25, width * 0.5, height * 0.5);
};

export let resize = ({ width, height }) => {

};
