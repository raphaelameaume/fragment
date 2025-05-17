import Mouse from '../inputs/Mouse.js';

/**
 * Register a callback to run on canvas mousedown
 * @param {Function} fn
 */
export const onMouseDown = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onMouseDown',
	});
};

/**
 * Register a callback to run on canvas mouseup
 * @param {Function} fn
 */
export const onMouseUp = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onMouseUp',
	});
};

/**
 * Register a callback to run on canvas mousemove
 * @param {Function} fn
 */
export const onMouseMove = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onMouseMove',
	});
};

/**
 * Register a callback to run on canvas click
 * @param {Function} fn
 */
export const onClick = (fn) => {
	Mouse.createTrigger(fn, {
		eventName: 'onClick',
	});
};
