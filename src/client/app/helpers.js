import { props } from './stores/props';

const propHandler = {
	set: function (target, key, value, receiver) {
		Reflect.set(target, key, value, receiver);

		if (key === 'value') {
			props.update((currentProps) => currentProps);
		}

		return true;
	},
};

const propsHandler = {
	get: (target, key) => {
		if (typeof target[key] === 'object' && target[key] !== null) {
			return new Proxy(target[key], propHandler);
		}
	},
	set: (target, key, value) => {
		console.log('new set', target, key, value);

		target[key] = value;

		props.update((currentProps) => currentProps);

		return true;
	},
	deleteProperty: (target, prop) => {
		if (prop in target) {
			delete target[prop];
			props.update((currentProps) => currentProps);

			return true;
		}
	},
};

export function reactiveProps(props = {}) {
	return new Proxy(props, propsHandler);
}
