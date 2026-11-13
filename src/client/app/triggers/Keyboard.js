import Keyboard from '../inputs/Keyboard';

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
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardTriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {void}
 */
/**
 * @param {string|KeyboardTriggerCallback} key
 * @param {KeyboardTriggerCallback} [fn]
 * @returns {void}
 */
export const onKeyPress = (key, fn) => {
	createTrigger('onKeyPress', key, fn);
};

/**
 * @overload
 * @param {KeyboardTriggerCallback} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardTriggerCallback} fn Handler called when one of the keys is pressed down.
 * @returns {void}
 */
/**
 * @param {string|KeyboardTriggerCallback} key
 * @param {KeyboardTriggerCallback} [fn]
 * @returns {void}
 */
export const onKeyDown = (key, fn) => {
	createTrigger('onKeyDown', key, fn);
};

/**
 * @overload
 * @param {KeyboardTriggerCallback} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {KeyboardTriggerCallback} fn Handler called when one of the keys is released.
 * @returns {void}
 */
/**
 * @param {string|KeyboardTriggerCallback} key
 * @param {KeyboardTriggerCallback} [fn]
 * @returns {void}
 */
export const onKeyUp = (key, fn) => {
	createTrigger('onKeyUp', key, fn);
};
