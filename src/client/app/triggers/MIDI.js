import MIDI from '../inputs/MIDI.js';

/**
 * Callback fired when the keyboard event occurs.
 * @typedef {import('../triggers/Trigger.js').TriggerCallback} MIDITriggerCallback
 * @typedef {import('./Trigger.js').default} Trigger
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
 * @returns {Trigger|undefined}
 */
function createTrigger(eventName, ...args) {
	/** @type {string[]} */
	let key = [];
	/** @type {MIDITriggerCallback|undefined} */
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

	if (!MIDI.enabled) {
		MIDI.request();
	}

	return MIDI.createTrigger(fn, {
		eventName,
		enabled: true,
		key,
	});
}

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {void}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {void}
 */
export const onNoteOn = (key, fn) => {
	createTrigger('onNoteOn', key, fn);
};

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {void}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {void}
 */
export const onNoteOff = (key, fn) => {
	createTrigger('onNoteOff', key, fn);
};

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {void}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {void}
 */
export const onNumberOn = (key, fn) => {
	createTrigger('onNumberOn', key, fn);
};

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {void}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {void}
 */
export const onNumberOff = (key, fn) => {
	createTrigger('onNumberOff', key, fn);
};

/**
 * @overload
 * @param {MIDITriggerCallback} key Handler called for any key.
 * @returns {void}
 */
/**
 * @overload
 * @param {string} key Comma-separated list of keys, e.g. `'a, b, Enter'`.
 * @param {MIDITriggerCallback} fn Handler called when one of the keys is pressed.
 * @returns {void}
 */
/**
 * @param {string|MIDITriggerCallback} key
 * @param {MIDITriggerCallback} [fn]
 * @returns {void}
 */
export const onControlChange = (key, fn) => {
	createTrigger('onControlChange', key, fn);
};
