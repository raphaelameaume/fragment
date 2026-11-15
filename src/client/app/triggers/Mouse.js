import Mouse from '../inputs/Mouse.js';

/**
 * Callback fired when the keyboard event occurs.
 * @typedef {import('../triggers/Trigger.js').TriggerCallback} MouseTriggerCallback
 * @typedef {import('../triggers/Trigger.js').Trigger} MouseTrigger
 */

/**
 * Register a callback to run on canvas mousedown
 * @param {MouseTriggerCallback} fn
 * @returns {MouseTrigger}
 */
export const onMouseDown = (fn) => {
	return Mouse.createTrigger(fn, {
		eventName: 'onMouseDown',
	});
};

/**
 * Register a callback to run on canvas mouseup
 * @param {MouseTriggerCallback} fn
 * @returns {MouseTrigger}
 */
export const onMouseUp = (fn) => {
	return Mouse.createTrigger(fn, {
		eventName: 'onMouseUp',
	});
};

/**
 * Register a callback to run on canvas mousemove
 * @param {MouseTriggerCallback} fn
 * @returns {MouseTrigger}
 */
export const onMouseMove = (fn) => {
	return Mouse.createTrigger(fn, {
		eventName: 'onMouseMove',
	});
};

/**
 * Register a callback to run on canvas click
 * @param {MouseTriggerCallback} fn
 * @returns {MouseTrigger}
 */
export const onClick = (fn) => {
	return Mouse.createTrigger(fn, {
		eventName: 'onClick',
	});
};
