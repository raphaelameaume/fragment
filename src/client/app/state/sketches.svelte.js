import { displayError } from '../state/errors.svelte.js';
import { sketches as all } from '@fragment/sketches';
import Sketch from './Sketch.svelte.js';
import { rendering } from './rendering.svelte.js';
import { removeHotListeners } from '../triggers/index.js';

class SketchesManager {
	sketches = $state({});
	keys = $derived(Object.keys(this.sketches));
	count = $derived(this.keys.length);

	async loadSketch(collection, key) {
		try {
			let sketch = await collection[key]();

			await rendering.preloadRenderer({
				renderingMode: sketch.rendering,
				customRenderer: sketch.renderer,
			});

			return sketch;
		} catch (error) {
			console.error(error);
			displayError(error, key);
		}
	}

	async loadAll(collection) {
		const keys = [...Object.keys(collection)];

		Object.keys(this.sketches).forEach((key) => {
			removeHotListeners(key);

			if (!keys.includes(key)) {
				delete this.sketches[key];
			}
		});

		const loadedSketches = await Promise.all(
			keys.map((key) => this.loadSketch(collection, key)),
		);

		const newSketches = keys.reduce((all, key, index) => {
			if (loadedSketches[index]) {
				all[key] = loadedSketches[index];
			}

			return all;
		}, {});

		const newInstancedSketches = Object.keys(newSketches).reduce(
			(all, key, index) => {
				const prevSketch = this.sketches[key];

				const instanced = new Sketch({
					key,
					instance: newSketches[key],
					previous: prevSketch,
				});

				all[key] = instanced;

				return all;
			},
			{},
		);

		this.sketches = newInstancedSketches;
	}
}

export let sketchesManager = new SketchesManager();
sketchesManager.loadAll(all);
