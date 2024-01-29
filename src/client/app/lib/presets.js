import paperSizes from './paper-sizes.js';
import convertLength from 'convert-length';

export const PRESET_ORIENTATIONS = {
	LANDSCAPE: 'landscape',
	PORTRAIT: 'portrait',
};

export default Object.keys(paperSizes);

/**
 * Compute the dimensions for a given preset
 * @param {string} preset
 * @param {object} params
 * @param {number} params.pixelsPerInch
 * @param {string} params.orientation
 * @returns {number[]} dimensions
 */
export function getDimensionsForPreset(
	preset,
	{ pixelsPerInch, orientation = PRESET_ORIENTATIONS.PORTRAIT },
) {
	const { dimensions, units } = paperSizes[preset];

	const [width, height] = dimensions.map((n) => {
		return convertLength(n, units, 'px', { pixelsPerInch });
	});

	return orientation === PRESET_ORIENTATIONS.PORTRAIT
		? [width, height]
		: [height, width];
}
