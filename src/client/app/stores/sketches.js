import { createStore } from "./utils.js";
import { displayError } from "../stores/errors";
import { folders } from "../stores/folders";
import { sketches as all, onSketchReload } from "@fragment/sketches";

export const sketches = createStore('sketches', {});
export const sketchesKeys = createStore('sketchesKeys', Object.keys(all));
export const sketchesCount = createStore('sketchesCount', 0);

async function loadSketch(collection, key) {
	try {
		let sketch = await collection[key]();

		return sketch;
	} catch (error) {
		displayError(error, key);
	}
}

async function loadAll(collection) {
	const keys = [...Object.keys(collection)];
	const loadedSketches = await Promise.all(keys.map((key) => loadSketch(collection, key)));

	const newSketches = keys.reduce((all, key, index) => {
		if (loadedSketches[index]) {
			all[key] = loadedSketches[index];
		}

		return all;
	}, {});

	sketches.update(() => newSketches);
	sketchesKeys.update(() => keys);
	sketchesCount.update(() => keys.length);
}

loadAll(all);

onSketchReload(({ sketches }) => {
	folders.set([]);
	loadAll(sketches);
});
