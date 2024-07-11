export function persist(key, data) {
	try {
		window.localStorage.setItem(`fragment.${key}`, JSON.stringify(data));
	} catch (err) {
		throw err;
	}
}

export function hydrate(key, target) {
	try {
		const data = JSON.parse(window.localStorage.getItem(`fragment.${key}`));

		if (target) {
			Object.keys(data).forEach((key) => {
				if (target[key] !== undefined) {
					target[key] = data[key];
				}
			});
		}

		return data;
	} catch (err) {
		console.error(err);
	}
}
