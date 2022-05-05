import paperSizes from "./paper-sizes.js";
import convertLength from "convert-length";

export default Object.keys(paperSizes);

export function getDimensionsForPreset(preset, { pixelsPerInch }) {
	const { dimensions, units } = paperSizes[preset];

	return dimensions.map(n => {
		return convertLength(n, units, "px", { pixelsPerInch });
	});
}
