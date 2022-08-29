import { createStore } from "./utils";

export const errors = createStore('errors', {});

export function displayError(error, context) {
	errors.update((current) => {
		if (!current[context]) {
			current[context] = [];
		}

		return {
			...current,
			[`${context}`]: [...current[context], error],
		}
	});
}

export function clearErrors(context) {
	errors.update((current) => {
		if (current[context]) {
			current[context] = [];
		}

		return current;
	});
}

window.addEventListener('error', () => {
	console.log(error);
});
