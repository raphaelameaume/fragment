import { writable } from 'svelte/store';
import { getContext } from '../triggers/shared';

let stores = new Map();

/**
 * Returns the value stored in localStorage for key or return defaultValue if it doesn't exist
 * @param {string} key
 * @param {any} defaultValue
 * @param {boolean} override
 * @returns {any} result
 */
export function rehydrate(key, defaultValue) {
	const storedValue = localStorage.getItem(`fragment.${key}`);

	if (storedValue) {
		return typeof storedValue === 'string'
			? JSON.parse(storedValue)
			: storedValue;
	}

	return defaultValue;
}

/**
 * Save value in localStorage
 * @param {string} key
 * @param {any} value
 */
export function save(key, value) {
	localStorage.setItem(`fragment.${key}`, JSON.stringify(value));
}

/**
 * Create store and register it for later usage
 * @param {string} key
 * @param {any} initialValue
 * @param {object} options
 * @returns {object} store
 */
export function createStore(
	key,
	initialValue,
	{ persist = false, reset = false } = {},
) {
	const value =
		persist && !reset ? rehydrate(key, initialValue) : initialValue;
	const store = writable(value);

	if (persist) {
		store.subscribe((current) => {
			save(key, current);
		});
	}

	stores.set(key, store);

	return store;
}

/**
 * Get an existing store from key or create it if it doesn't exist yet
 * @param {string} key
 * @param {any} initialValue
 * @param {object} options
 * @returns {object} store
 */
export function getStore(
	key,
	initialValue,
	{ persist = false, reset = false } = {},
) {
	if (!stores.has(key)) {
		return createStore(key, initialValue, { persist, reset });
	}

	return stores.get(key);
}

/**
 * Create a new store to register callbacks grouped by context
 * @param {string} name
 */
export function createHookStore(name) {
	const store = writable(new Map());

	const hook = (fn, { context = getContext() } = {}) => {
		if (typeof fn !== 'function') {
			console.warn(`${name} argument must be a function.`);
		}

		store.update((hooks) => {
			if (!hooks.has(context)) {
				hooks.set(context, []);
			}

			hooks.set(context, [...hooks.get(context), fn]);

			return hooks;
		});

		return () => {
			store.update((hooks) => {
				hooks.set(
					context,
					[...hooks.get(context)].filter((hook) => hook !== fn),
				);

				return hooks;
			});
		};
	};

	const remove = (context) => {
		store.update((hooks) => {
			hooks.delete(context);

			return hooks;
		});
	};

	return [store, hook, remove];
}
