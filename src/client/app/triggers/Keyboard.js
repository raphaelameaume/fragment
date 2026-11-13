import Keyboard from '../inputs/Keyboard';

/**
 * Callback fired when the keyboard event occurs.
 * @typedef {import('../triggers/Trigger.js').TriggerFn} KeyboardFn
 */

/**
 * Creates a keyboard trigger. Accepts either `(fn)` to listen to all keys,
 * or `(keys, fn)` where `keys` is a comma-separated list of keys.
 *
 * @param {string} eventName
 * @param {...(string|KeyboardFn|undefined)} args
 * @returns {void}
 */
function createTrigger(eventName, ...args) {
	/** @type {string[]} */
	let key = [];
	/** @type {KeyboardFn|undefined} */
	let fn;

	if (typeof args[0] === 'string' && typeof args[1] === 'function') {
		key.push(...args[0].split(',').map((k) => k.trim()));
		fn = args[1];
	} else if (typeof args[0] === 'function') {
		fn = args[0];
	}

	if (!fn) {
		return;
	}

	if (fn) {
		Keyboard.createTrigger(fn, {
			eventName,
			enabled: true,
			key,
		});
	}
}

/**
 * @overload
 * @param {KeyboardFn} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardFn} fn Handler called when one of the keys is pressed.
 * @returns {void}
 */
/**
 * @param {string|KeyboardFn} key
 * @param {KeyboardFn} [fn]
 * @returns {void}
 */
export const onKeyPress = (key, fn) => {
	createTrigger('onKeyPress', key, fn);
};

/**
 * @overload
 * @param {KeyboardFn} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardFn} fn Handler called when one of the keys is pressed down.
 * @returns {void}
 */
/**
 * @param {string|KeyboardFn} key
 * @param {KeyboardFn} [fn]
 * @returns {void}
 */
export const onKeyDown = (key, fn) => {
	createTrigger('onKeyDown', key, fn);
};

/**
 * @overload
 * @param {KeyboardFn} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardFn} fn Handler called when one of the keys is released.
 * @returns {void}
 */
/**
 * @param {string|KeyboardFn} key
 * @param {KeyboardFn} [fn]
 * @returns {void}
 */
export const onKeyUp = (key, fn) => {
	createTrigger('onKeyUp', key, fn);
};
