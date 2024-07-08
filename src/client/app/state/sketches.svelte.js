import { displayError } from '../stores/errors';
import { sketches as all } from '@fragment/sketches';

export let sketches = $state({});
export let sketchesKeys = $state(Object.keys(all));
export let sketchesCount = $state(0);

async function loadSketch(collection, key) {
	try {
		let sketch = await collection[key]();

		return sketch;
	} catch (error) {
		displayError(error, key);
	}
}

export async function loadAll(collection) {
	const keys = [...Object.keys(collection)];
	const loadedSketches = await Promise.all(
		keys.map((key) => loadSketch(collection, key)),
	);

	const newSketches = keys.reduce((all, key, index) => {
		if (loadedSketches[index]) {
			all[key] = loadedSketches[index];
		}

		return all;
	}, {});

	Object.keys(sketches).forEach((key) => {
		delete sketches[key];
	});

	Object.keys(newSketches).forEach((key) => {
		sketches[key] = newSketches[key];
	});

	sketchesKeys.length = 0;
	sketchesKeys.push(...keys);

	console.log({ sketchesKeys });

	// sketchesCount = keys.length;

	// sketches.length = 0;
	// sketches.push(...newSketches);

	// Object.assign(sketches, newSketches);
	// Object.assign(sketchesKeys, keys);

	// sketches = newSketches;
	// sketchesKeys = keys;
	// sketchesCount = keys.length;
}

// loadAll(all);
