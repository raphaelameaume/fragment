/**
 * @template K, V
 * @callback FindIndexCallback
 * @param {V} item - The item to test
 * @param {number} index - The index of the item
 * @param {V[]} array - The array being searched
 * @returns {boolean}
 */

/**
 * Add an item to an array stored in a Map
 * @template K, V
 * @param {Map<K, V[]>} map - The Map containing arrays as values
 * @param {K} key - The key to store the item under
 * @param {V} item - The item to add to the array
 * @returns {void}
 */
export const addToMapArray = (map, key, item) => {
	const previous = map.get(key);

	if (Array.isArray(previous)) {
		map.set(key, [...previous, item]);
	} else {
		map.set(key, [item]);
	}
};

/**
 * Remove an item from an array stored in a Map
 * @template K, V
 * @param {Map<K, V[]>} map - The Map containing arrays as values
 * @param {K} key - The key where the array is stored
 * @param {(item: V, index: number, array: V[]) => boolean} findIndex - Callback to find the item to remove
 * @returns {void}
 */
export const removeFromMapArray = (map, key, findIndex) => {
	const items = map.get(key);

	if (Array.isArray(items)) {
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
