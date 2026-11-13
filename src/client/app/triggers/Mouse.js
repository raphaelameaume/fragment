import Mouse from '../inputs/Mouse.js';

/**
 * Callback fired when the keyboard event occurs.
 * @typedef {import('../triggers/Trigger.js').TriggerCallback} MouseTriggerCallback
 */

/**
 * Register a callback to run on canvas mousedown
 * @param {MouseTriggerCallback} fn
 */
export const onMouseDown = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onMouseDown',
	});
};

/**
 * Register a callback to run on canvas mouseup
 * @param {MouseTriggerCallback} fn
 */
export const onMouseUp = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onMouseUp',
	});
};

/**
 * Register a callback to run on canvas mousemove
 * @param {MouseTriggerCallback} fn
 */
export const onMouseMove = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onMouseMove',
	});
};

/**
 * Register a callback to run on canvas click
 * @param {MouseTriggerCallback} fn
 */
export const onClick = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onClick',
	});
};
