import { PRESET_ORIENTATIONS } from '../lib/presets';
import { persist, hydrate } from './utils.svelte';

export const SIZES = {
	FIXED: 'fixed',
	PRESET: 'preset',
	ASPECT_RATIO: 'aspect-ratio',
	WINDOW: 'window',
	SCALE: 'scale',
};

class Rendering {
	width = $state(1024);
	height = $state(1024);
	pixelRatio = $state(1);
	resizing = $state(SIZES.FIXED);
	aspectRatio = $state(1);
	scale = $state(1);
	preset = $state('a4');
	presetOrientation = $state(PRESET_ORIENTATIONS.PORTRAIT);

	constructor() {
		this.key = 'rendering';

		$effect.root(() => {
			$effect(() => {
				persist(this.key, {
					width: this.width,
					height: this.height,
					pixelRatio: this.pixelRatio,
					resizing: this.resizing,
					aspectRatio: this.aspectRatio,
					scale: this.scale,
					preset: this.preset,
					presetOrientation: this.presetOrientation,
				});
			});
		});

		hydrate(this.key, this);
	}
}

export let rendering = new Rendering();
