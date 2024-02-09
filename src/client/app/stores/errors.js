import { createStore } from './utils';

export const errors = createStore('errors', new Map());

export function displayError(error, context) {
	errors.update((current) => {
		current.set(context, error);

		return current;
	});
}

export function clearError(context) {
	errors.update((current) => {
		if (current.has(context)) {
			current.delete(context);
		}

		return current;
	});
}

export function clearErrors() {
	errors.update(() => new Map());
}
