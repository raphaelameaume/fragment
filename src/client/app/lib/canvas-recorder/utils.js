import { changeDpiDataUrl } from 'changedpi';

const supportedEncodings = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * @typedef {Object} ExportCanvasOptions
 * @property {string} [encoding='image/png'] - Image MIME type (image/png, image/jpeg, image/webp)
 * @property {number} [encodingQuality=0.92] - Image quality (0-1)
 * @property {number} [pixelsPerInch=72] - DPI/PPI for the exported image
 */

/**
 * @typedef {Object} ExportCanvasResult
 * @property {string} extension - File extension (e.g., '.png', '.jpg')
 * @property {string} dataURL - Data URL of the exported canvas
 */

/**
 * Export a canvas to a data URL with specified encoding and DPI
 * @param {HTMLCanvasElement} canvas - The canvas to export
 * @param {ExportCanvasOptions} [options={}] - Export options
 * @returns {ExportCanvasResult}
 * @throws {Error} If encoding is not supported
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
