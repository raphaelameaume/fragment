import { writable } from 'svelte/store';
import { client } from '../client';
import { createStore } from './utils';
import { getDimensionsForPreset } from '../lib/presets';
import { getContext } from '../triggers/shared';

export const SIZES = {
	FIXED: 'fixed',
	PRESET: 'preset',
	ASPECT_RATIO: 'aspect-ratio',
	WINDOW: 'window',
	SCALE: 'scale',
};

export const SIZES_VALUES = Object.values(SIZES);

export const rendering = createStore(
	`rendering`,
	{
		width: 1024,
		height: 1024,
		pixelRatio: 1,
		resizing: SIZES.FIXED,
		aspectRatio: 1,
		scale: 1,
		preset: 'a4',
	},
	{
		persist: !__BUILD__,
		reset: false,
	},
);

export const monitors = createStore('monitors', []);
export const preview = createStore('preview', null);

export const override = (config) => {
	const { canvasSize = SIZES.WINDOW } = config;
	const resizing = canvasSize;

	const overrides = {
		resizing,
	};

	if (config.dimensions && config.dimensions.length === 2) {
		const { dimensions } = config;
		overrides.width = dimensions[0];
		overrides.height = dimensions[1];

		if (!config.canvasSize) {
			overrides.resizing = SIZES.FIXED;
		}
	}

	if (resizing === SIZES.PRESET) {
		if (config.preset) {
			const [width, height] = getDimensionsForPreset(config.preset, {
				pixelsPerInch: 300,
			});

			overrides.width = width;
			overrides.height = height;
		} else {
			overrides.resizing = SIZES.WINDOW;
			console.warn(
				`Cannot apply canvasSize preset if 'preset' is not specified in config.`,
			);
		}
	}

	if (resizing === SIZES.ASPECT_RATIO) {
		if (isNaN(config.aspectRatio)) {
			overrides.resizing = SIZES.WINDOW;
			console.warn(
				`Cannot apply canvasSize:"aspectRatio" if 'aspectRatio' is not specified in config.`,
			);
		}
	}

	if (resizing === SIZES.SCALE) {
		if (!config.dimensions) {
			console.warn(
				`Cannot apply canvasSize:"scale" if no dimensions are specified.`,
			);
			overrides.resizing = SIZES.WINDOW;
		}

		if (isNaN(config.scale)) {
			console.warn(
				`Cannot apply canvasSize:"scale" if 'scale' is not specified in config.`,
			);
			overrides.resizing = SIZES.WINDOW;
		} else {
			overrides.scale = config.scale;
		}
	}

	if (config.pixelRatio) {
		const { pixelRatio } = config;
		overrides.pixelRatio =
			typeof pixelRatio === 'function' ? pixelRatio() : pixelRatio;
	}

	updateRendering(overrides);
};

/* sync across clients */
let isSynchronized = false;

export const sync = writable(isSynchronized);

function checkForSync({ clientCount } = {}) {
	let prev = isSynchronized;
	isSynchronized = clientCount > 0;

	if (prev && !isSynchronized) {
		console.warn('[fragment] Sketch is running at specified framerate.');
	} else if (!prev && isSynchronized) {
		console.warn(
			'[fragment] Multiple instances of Fragment detected. Running sketch(s) at simulated framerate.',
		);
	}

	if (prev !== isSynchronized) {
		sync.set(isSynchronized);
	}
}

client.on('start', checkForSync);
client.on('client-connect', checkForSync);
client.on('client-disconnect', checkForSync);

class CanvasObserver extends MutationObserver {
	constructor() {
		super((mutationsList) => {
			if (
				mutationsList.some(
					(mutation) =>
						mutation.attributeName === 'width' ||
						mutation.attributeName === 'height',
				)
			) {
				const { target } = mutationsList[0];

				console.trace('Canvas size has been changed', getContext());

				if (!this.paused) {
					// rendering.update((current) => ({
					// 	...current,
					// 	width: target.width,
					// 	height: target.height,
					// 	pixelRatio: 1,
					// 	resizing: SIZES.FIXED,
					// }));
				} else {
					console.log('Canvas size has been changed from fragment');
				}
			}
		});

		this.paused = true;
	}

	pause() {
		this.paused = true;
	}

	resume() {
		this.paused = false;

		// prevent previous mutations to trigger after resume
		this.takeRecords();
	}
}

export let observer = new CanvasObserver();

/**
 * Update rendering store
 * @param {object} params
 * @param {number} [params.width]
 * @param {number} [params.height]
 * @param {number} [params.pixelRatio]
 * @param {string} [params.resizing]
 * @param {number} [params.aspectRatio]
 * @param {number} [params.scale]
 * @param {string} [params.preset]
 */
export const updateRendering = (params = {}) => {
	rendering.update((current) => {
		if (params.resizing === SIZES.PRESET || params.preset) {
			const preset = params.preset || current.preset;

			const [width, height] = getDimensionsForPreset(preset, {
				pixelsPerInch: 300,
			});

			params.width = width;
			params.height = height;
			params.pixelRatio = 1;
		}

		return {
			...current,
			...params,
		};
	});
};
