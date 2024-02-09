import { createStore } from './utils';

export const multisampling = createStore('multisampling', [], {
	persist: !__BUILD__,
	reset: true,
});

export const threshold = createStore('threshold', 0, {
	persist: !__BUILD__,
	reset: false,
});

export const transition = createStore('transition', false, {
	persist: !__BUILD__,
	reset: false,
});
