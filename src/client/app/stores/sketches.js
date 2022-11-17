import { createStore } from "./utils.js";
import { displayError } from "../stores/errors";
import { sketches as all, onSketchReload } from "@fragment/sketches";
import { elements, elementsNext } from "../stores/folders";
import { get } from "svelte/store";

export const sketches = createStore('sketches', {});
export const sketchesKeys = createStore('sketchesKeys', Object.keys(all));
export const sketchesCount = createStore('sketchesCount', 0);

let unsubscribe;

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

	if (unsubscribe) {
		unsubscribe();
	}

	elementsNext.set([]); // REMOVE TEMP TO FIX OVERLOAD

	const loadedSketches = await Promise.all(keys.map((key) => loadSketch(collection, key)));

	const newSketches = keys.reduce((all, key, index) => {
		if (loadedSketches[index]) {
			all[key] = loadedSketches[index];
		}

		return all;
	}, {});

	const elsNext = get(elementsNext);

	// should reconcile state here
	elements.set(elsNext);

	// elements added asyncronously are properly added
	unsubscribe = elementsNext.subscribe((value) => {
		elements.set(value);
	});

	sketches.set(newSketches);
	sketchesKeys.set(keys);
	sketchesCount.set(keys.length);
}

loadAll(all);

onSketchReload(({ sketches }) => {
	loadAll(sketches);
});
