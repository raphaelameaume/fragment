export function persist(key, data) {
	try {
		window.localStorage.setItem(`fragment.${key}`, JSON.stringify(data));
	} catch (err) {
		throw err;
	}
}

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

export function isObject(item) {
	return item && typeof item === 'object';
}

export function isFunction(item) {
	return item && typeof item === 'function';
}

export function deepAssign(target, source) {
	for (const key in source) {
		if (isObject(source[key]) && isObject(target[key])) {
			deepAssign(target[key], source[key]);
		} else {
			Object.assign(target, { [key]: source[key] });
		}
	}
}

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
