/**
 *
 * @param {Map} map
 * @param {string} key
 * @param {any} find
 */
export const addToMapArray = (map, key, item) => {
	if (map.has(key)) {
		map.set(key, [...map.get(key), item]);
	} else {
		map.set(key, [item]);
	}
};

/**
 *
 * @param {Map} map
 * @param {string} key
 * @param {function} findIndex
 */
export const removeFromMapArray = (map, key, findIndex) => {
	if (map.has(key)) {
		const items = map.get(key);
		const index = items.findIndex(findIndex);

		if (index >= 0) {
			const newItems = [...items];
			newItems.splice(index, 1);

			if (newItems.length > 0) {
				map.set(key, newItems);
			} else {
				map.delete(key);
			}
		}
	} else {
		console.error(
			`removeFromMapArray: key ${key} doesn't exist in Map.`,
			map,
		);
	}
};
