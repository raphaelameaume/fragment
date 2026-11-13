import Mouse from '../inputs/Mouse.js';

/**
 * Register a callback to run on canvas mousedown
 * @param {import('../triggers/Trigger.js').TriggerFn} fn
 */
export const onMouseDown = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onMouseDown',
	});
};

/**
 * Register a callback to run on canvas mouseup
 * @param {import('../triggers/Trigger.js').TriggerFn} fn
 */
export const onMouseUp = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onMouseUp',
	});
};

/**
 * Register a callback to run on canvas mousemove
 * @param {import('../triggers/Trigger.js').TriggerFn} fn
 */
export const onMouseMove = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onMouseMove',
	});
};

/**
 * Register a callback to run on canvas click
 * @param {import('../triggers/Trigger.js').TriggerFn} fn
 */
export const onClick = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onClick',
	});
};
