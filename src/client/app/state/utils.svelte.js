/**
 * Persists data to localStorage with a "fragment." prefix
 * @param {string} key - The storage key (will be prefixed with "fragment.")
 * @param {any} data - The data to store (will be JSON stringified)
 * @throws {Error} If localStorage operation fails
 */
export function persist(key, data) {
	try {
		window.localStorage.setItem(`fragment.${key}`, JSON.stringify(data));
	} catch (err) {
		throw err;
	}
}

/**
 * Retrieves and optionally merges data from localStorage
 * @param {string} key - The storage key (will be prefixed with "fragment.")
 * @param {Record<string, any>} [target={}] - Optional target object to merge data into
 * @param {any} [defaultValue={}] - Default value to return if no data found
 * @returns {any} The retrieved data, defaultValue if not found, or undefined on error
 */
export function hydrate(key, target = {}, defaultValue = {}) {
	try {
		const storageKey = `fragment.${key}`;
		const item = window.localStorage.getItem(storageKey);

		if (item) {
			const data = JSON.parse(item);

			if (target && typeof data === 'object') {
				Object.keys(data).forEach((key) => {
					if (target[key] !== undefined) {
						target[key] = data[key];
					}
				});
			}

			return data;
		}

		return defaultValue;
	} catch (err) {
		console.error(err);
	}
}

/**
 * Checks if a value is an object
 * @param {any} item - The value to check
 * @returns {boolean} True if the value is an object
 */
export function isObject(item) {
	return item && typeof item === 'object';
}

/**
 * Checks if a value is a function
 * @param {any} item - The value to check
 * @returns {boolean} True if the value is a function
 */
export function isFunction(item) {
	return item && typeof item === 'function';
}

/**
 * Returns true if the given cache key contains the data:image scheme.
 * @param {any} value
 * @return {boolean} Whether the given cache url contains the blob: scheme or not.
 */
export function isDataURL(value) {
	return typeof value === 'string' && value.startsWith('data:image/');
}

/**
 * Recursively assigns properties from source to target
 * @param {Record<string, any>} target - The target object to assign to
 * @param {Record<string, any>} source - The source object to assign from
 * @returns {void}
 */
export function deepAssign(target, source) {
	for (const key in source) {
		if (isObject(source[key]) && isObject(target[key])) {
			deepAssign(target[key], source[key]);
		} else {
			Object.assign(target, { [key]: source[key] });
		}
	}
}

/**
 * Recursively compares two values for deep equality
 * @param {any} target - The first value to compare
 * @param {any} source - The second value to compare
 * @returns {boolean} True if the values are deeply equal
 */
export function deepEqual(target, source) {
	if (isObject(target) && isObject(source)) {
		let isEqual = true;

		if (
			Array.isArray(target) &&
			Array.isArray(source) &&
			target.length !== source.length
		) {
			isEqual = false;
		}

		if (isEqual) {
			for (const key in source) {
				if (isEqual) {
					isEqual = deepEqual(target[key], source[key]);
				}
			}
		}

		return isEqual;
	}

	return target === source;
}

/**
 * Creates a deep clone of a value
 * @param {any} value - The value to clone
 * @returns {any} A deep clone of the value, or the original value if cloning fails
 */
export function deepClone(value) {
	if (isFunction(value)) {
		return value;
	}

	if (isObject(value)) {
		try {
			const clone = structuredClone(
				Array.isArray(value) ? [...value] : { ...value },
			);
			return clone;
		} catch (error) {
			console.error(error);
			return value;
		}
	}

	return value;
}
