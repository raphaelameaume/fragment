import { SvelteMap } from 'svelte/reactivity';

export let errors = new SvelteMap();

export function displayError(error, context) {
	errors.set(context, error);
}

export function clearError(context) {
	if (errors.has(context)) {
		errors.delete(context);
	}
}

export function clearErrors() {
	errors.clear();
}
