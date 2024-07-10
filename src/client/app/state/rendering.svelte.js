import { PRESET_ORIENTATIONS, getDimensionsForPreset } from '../lib/presets';

export const SIZES = {
	FIXED: 'fixed',
	PRESET: 'preset',
	ASPECT_RATIO: 'aspect-ratio',
	WINDOW: 'window',
	SCALE: 'scale',
};

class Rendering {
	current = $state({
		width: 1024,
		height: 1024,
		pixelRatio: 1,
		resizing: SIZES.FIXED,
		aspectRatio: 1,
		scale: 1,
		preset: 'a4',
		presetOrientation: PRESET_ORIENTATIONS.PORTRAIT,
	});
	width = $derived(this.current.width);
}

export let rendering = new Rendering();
