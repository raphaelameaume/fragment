const state = {
	hello: 'world',
};

export function save(key, value) {
	console.log('database :: save');
	state[key] = value;
}

export function read() {
	return state;
}

export default {
	read,
	save,
};
