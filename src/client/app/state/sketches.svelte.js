import { displayError } from '../state/errors.svelte.js';
import { sketches as all } from '@fragment/sketches';
import Sketch from './Sketch.svelte.js';

class SketchesManager {
	sketches = $state({});
	keys = $state([]);
	count = $state(0);

	async loadSketch(collection, key) {
		try {
			let sketch = await collection[key]();

			return sketch;
		} catch (error) {
			displayError(error, key);
		}
	}

	async loadAll(collection) {
		const keys = [...Object.keys(collection)];
		const loadedSketches = await Promise.all(
			keys.map((key) => this.loadSketch(collection, key)),
		);

		const newSketches = keys.reduce((all, key, index) => {
			if (loadedSketches[index]) {
				all[key] = loadedSketches[index];
			}

			return all;
		}, {});

		Object.keys(this.sketches).forEach((key) => {
			if (!keys.includes(key)) {
				delete this.sketches[key];
			}
		});

		const newInstancedSketches = Object.keys(newSketches).map((key) => {
			const prevSketch = this.sketches[key];
			const instanced = new Sketch({
				key,
				instance: newSketches[key],
				previous: prevSketch,
			});

			return instanced;
		});

		this.sketches = newInstancedSketches;
		this.keys.length = 0;
		this.keys.push(...Object.keys(this.sketches));
		this.count = this.keys.length;
	}
}

export let sketchesManager = new SketchesManager();
sketchesManager.loadAll(all);
