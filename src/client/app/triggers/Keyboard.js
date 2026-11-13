import Keyboard from '../inputs/Keyboard';
import Trigger from '../triggers/Trigger.js';

/**
 * Callback fired when the keyboard event occurs.
 * @typedef {import('../triggers/Trigger.js').TriggerCallback} KeyboardTriggerCallback
 */

/**
 * Creates a keyboard trigger. Accepts either `(fn)` to listen to all keys,
 * or `(keys, fn)` where `keys` is a comma-separated list of keys.
 *
 * @param {string} eventName
 * @param {...(string|KeyboardTriggerCallback|undefined)} args
 * @returns {import('../triggers/Trigger.js').Trigger|undefined}
 */
function createTrigger(eventName, ...args) {
	/** @type {string[]} */
	let key = [];
	/** @type {KeyboardTriggerCallback|undefined} */
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

	return Keyboard.createTrigger(fn, {
		eventName,
		enabled: true,
		key,
	});
}

/**
 * @overload
 * @param {KeyboardTriggerCallback} key Handler called for any key.
 * @returns {Trigger|undefined}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardTriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {Trigger|undefined}
 */
/**
 * @param {string|KeyboardTriggerCallback} key
 * @param {KeyboardTriggerCallback} [fn]
 * @returns {Trigger|undefined}
 */
export const onKeyPress = (key, fn) => {
	return createTrigger('onKeyPress', key, fn);
};

/**
 * @overload
 * @param {KeyboardTriggerCallback} key Handler called for any key.
 * @returns {Trigger|undefined}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardTriggerCallback} fn Handler called when one of the keys is pressed down.
 * @returns {Trigger|undefined}
 */
/**
 * @param {string|KeyboardTriggerCallback} key
 * @param {KeyboardTriggerCallback} [fn]
 * @returns {Trigger|undefined}
 */
export const onKeyDown = (key, fn) => {
	return createTrigger('onKeyDown', key, fn);
};

/**
 * @overload
 * @param {KeyboardTriggerCallback} key Handler called for any key.
 * @returns {Trigger|undefined}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardTriggerCallback} fn Handler called when one of the keys is released.
 * @returns {Trigger|undefined}
 */
/**
 * @param {string|KeyboardTriggerCallback} key
 * @param {KeyboardTriggerCallback} [fn]
 * @returns {Trigger|undefined}
 */
export const onKeyUp = (key, fn) => {
	return createTrigger('onKeyUp', key, fn);
};
