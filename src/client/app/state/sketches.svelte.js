import { displayError } from '../state/errors.svelte.js';

import { sketches as all } from 'virtual:sketches';

import Sketch from './Sketch.svelte.js';
import { rendering } from './rendering.svelte.js';
import { removeHotListeners } from '../triggers/index.js';

/**
 * @typedef {Object} SketchInstance
 * @property {string} [rendering]
 * @property {any} [renderer]
 */

/**
 * @typedef {Record<string, () => Promise<SketchInstance>>} SketchCollection
 */

class SketchesManager {
	/** @type {Record<string, Sketch>} */
	sketches = $state({});
	keys = $derived(Object.keys(this.sketches));
	count = $derived(this.keys.length);

	/**
	 * Load a single sketch from a collection
	 * @param {SketchCollection} collection - The collection of sketches
	 * @param {string} key - The key of the sketch to load
	 * @returns {Promise<SketchInstance | undefined>}
	 */
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

	/**
	 * Load all sketches from a collection
	 * @param {SketchCollection} collection - The collection of sketches to load
	 * @returns {Promise<void>}
	 */
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

		/** @type {Record<string, SketchInstance>} */
		const newSketches = keys.reduce(
			/**
			 * @param {Record<string, SketchInstance>} all
			 * @param {string} key
			 * @param {number} index
			 */
			(all, key, index) => {
				if (loadedSketches[index]) {
					all[key] = loadedSketches[index];
				}

				return all;
			},
			{},
		);

		/** @type {Record<string, Sketch>} */
		const newInstancedSketches = Object.keys(newSketches).reduce(
			/**
			 * @param {Record<string, Sketch>} all
			 * @param {string} key
			 */
			(all, key) => {
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
