import Keyboard from '../inputs/Keyboard';

/**
 * Callback fired when the keyboard event occurs.
 * @typedef {import('../triggers/Trigger.js').TriggerCallback} KeyboardTriggerCallback
 * @typedef {import('../triggers/Trigger.js').Trigger} KeyboardTrigger
 */

/**
 * Creates a keyboard trigger. Accepts either `(fn)` to listen to all keys,
 * or `(keys, fn)` where `keys` is a comma-separated list of keys.
 *
 * @param {string} eventName
 * @param {...(string|KeyboardTriggerCallback|undefined)} args
 * @returns {KeyboardTrigger}
 */
function createTrigger(eventName, ...args) {
	/** @type {string[]} */
	let key = [];
	/** @type {KeyboardTriggerCallback|undefined} */
	let fn;

	if (typeof args[0] === 'string') {
		key.push(...args[0].split(',').map((k) => k.trim()));

		if (typeof args[1] === 'function') {
			fn = args[1];
		}
	} else if (typeof args[0] === 'function') {
		fn = args[0];
	}

	return Keyboard.createTrigger(fn, {
		eventName,
		enabled: true,
		params: {
			key,
		},
	});
}

/**
 * @overload
 * @param {KeyboardTriggerCallback} key Handler called for any key.
 * @returns {KeyboardTrigger}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardTriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {KeyboardTrigger}
 */
/**
 * @param {string|KeyboardTriggerCallback} key
 * @param {KeyboardTriggerCallback} [fn]
 * @returns {KeyboardTrigger}
 */
export const onKeyPress = (key, fn) => {
	return createTrigger('onKeyPress', key, fn);
};

/**
 * @overload
 * @param {KeyboardTriggerCallback} key Handler called for any key.
 * @returns {KeyboardTrigger}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardTriggerCallback} fn Handler called when one of the keys is pressed down.
 * @returns {KeyboardTrigger}
 */
/**
 * @param {string|KeyboardTriggerCallback} key
 * @param {KeyboardTriggerCallback} [fn]
 * @returns {KeyboardTrigger}
 */
export const onKeyDown = (key, fn) => {
	return createTrigger('onKeyDown', key, fn);
};

/**
 * @overload
 * @param {KeyboardTriggerCallback} key Handler called for any key.
 * @returns {KeyboardTrigger}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardTriggerCallback} fn Handler called when one of the keys is released.
 * @returns {KeyboardTrigger}
 */
/**
 * @param {string|KeyboardTriggerCallback} key
 * @param {KeyboardTriggerCallback} [fn]
 * @returns {KeyboardTrigger}
 */
export const onKeyUp = (key, fn) => {
	return createTrigger('onKeyUp', key, fn);
};
