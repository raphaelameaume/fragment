import MIDI from '../inputs/MIDI.js';

/**
 * Callback fired when the keyboard event occurs.
 * @typedef {import('../triggers/Trigger.js').TriggerCallback} MIDITriggerCallback
 * @typedef {import('./Trigger.js').Trigger} MIDITrigger
 */

/**
 * @typedef {'onNoteOn'|'onNoteOff'|'onNumberOn'|'onNumberOff'|'onControlChange'} MIDITriggerEventName
 */

/**
 * @typedef {{
 *   key?: string|string[],
 *   hot?: boolean,
 *   enabled?: boolean,
 *   context?: string,
 * } & Record<string, any>} MIDITriggerOptions
 */

/**
 * @param {string} eventName
 * @param {...(string|MIDITriggerCallback|undefined)} args
 * @returns {MIDITrigger}
 */
function createTrigger(eventName, ...args) {
	/** @type {string[]} */
	let key = [];
	/** @type {MIDITriggerCallback|undefined} */
	let fn;

	if (typeof args[0] === 'string') {
		key.push(...args[0].split(',').map((k) => k.trim()));

		if (typeof args[1] === 'function') {
			fn = args[1];
		}
	} else if (typeof args[0] === 'function') {
		fn = args[0];
	}

	if (!MIDI.enabled) {
		MIDI.request();
	}

	return MIDI.createTrigger(fn, {
		eventName,
		enabled: true,
		params: {
			key,
		},
	});
}

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {MIDITrigger}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {MIDITrigger}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {MIDITrigger}
 */
export const onNoteOn = (key, fn) => {
	return createTrigger('onNoteOn', key, fn);
};

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {MIDITrigger}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {MIDITrigger}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {MIDITrigger}
 */
export const onNoteOff = (key, fn) => {
	return createTrigger('onNoteOff', key, fn);
};

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {MIDITrigger}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {MIDITrigger}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {MIDITrigger}
 */
export const onNumberOn = (key, fn) => {
	return createTrigger('onNumberOn', key, fn);
};

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {MIDITrigger}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {MIDITrigger}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {MIDITrigger}
 */
export const onNumberOff = (key, fn) => {
	return createTrigger('onNumberOff', key, fn);
};

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {MIDITrigger}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {MIDITrigger}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {MIDITrigger}
 */
export const onControlChange = (key, fn) => {
	return createTrigger('onControlChange', key, fn);
};
