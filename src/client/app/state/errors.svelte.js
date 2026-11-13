import { SvelteMap } from 'svelte/reactivity';

/**
 * Map storing errors by context
 * @type {SvelteMap<string, Error>}
 */
export let errors = new SvelteMap();

/**
 * Display an error for a specific context
 * @param {Error | any} error - The error to display
 * @param {string} context - The context identifier for the error
 * @returns {void}
 */
export function displayError(error, context) {
	errors.set(context, error);
}

/**
 * Clear the error for a specific context
 * @param {string} context - The context identifier
 * @returns {void}
 */
export function clearError(context) {
	if (errors.has(context)) {
		errors.delete(context);
	}
}

/**
 * Clear all errors
 * @returns {void}
 */
export function clearErrors() {
	errors.clear();
}
