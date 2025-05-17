import Keyboard from '../inputs/Keyboard';
import { wildcard, getContext } from './shared';

function createTrigger(eventName, ...args) {
	let key = [];
	let fn = args[0];

	if (typeof args[0] === 'string' && typeof args[1] === 'function') {
		key.push(...args[0].split(',').map((k) => k.trim()));
		fn = args[1];
	}

	Keyboard.createTrigger(fn, {
		eventName,
		enabled: true,
		key,
	});
}

/**
 *
 * @param {string|Function} key
 * @param {Function} fn
 */
export const onKeyPress = (key, fn) => {
	createTrigger('onKeyPress', key, fn);
};

/**
 *
 * @param {string|Function} key
 * @param {Function} fn
 */
export const onKeyDown = (key, fn) => {
	createTrigger('onKeyDown', key, fn);
};

/**
 *
 * @param {string|Function} key
 * @param {Function} fn
 */
export const onKeyUp = (key, fn) => {
	createTrigger('onKeyUp', key, fn);
};
