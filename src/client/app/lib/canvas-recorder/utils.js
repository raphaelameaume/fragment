import { changeDpiDataUrl } from 'changedpi';

const supportedEncodings = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Create a Data URL from a canvas
 * @param {HTMLCanvasElement} canvas
 * @param {object} [options]
 * @param {string} [encoding="image/png"]
 * @param {number} [encodingQuality=0.92]
 * @param {number} [pixelsPerInch=72]
 * @returns {object} result
 * @returns {string} result.dataURL
 * @returns {string} result.extension
 */
export function exportCanvas(
	canvas,
	{ encoding = 'image/png', encodingQuality = 0.92, pixelsPerInch = 72 } = {},
) {
	if (!supportedEncodings.includes(encoding))
		throw new Error(`Invalid canvas encoding ${encoding}`);

	let extension = (encoding.split('/')[1] || '').replace(/jpeg/i, 'jpg');
	if (extension) {
		extension = `.${extension}`.toLowerCase();
	}

	let dataURL = canvas.toDataURL(encoding, encodingQuality);

	if (encoding !== 'image/webp' && pixelsPerInch !== 72) {
		dataURL = changeDpiDataUrl(dataURL, pixelsPerInch);
	}

	return {
		extension,
		dataURL,
	};
}
