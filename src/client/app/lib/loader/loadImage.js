/**
 * @typedef {Object} LoadImageOptions
 * @property {HTMLImageElement} [img] existing image element to load into
 */

/**
 * Load an image and resolve once it has finished loading
 * @param {string} url
 * @param {LoadImageOptions} [options]
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(url, { img = new Image() } = {}) {
	return new Promise((resolve, reject) => {
		function onLoad() {
			img.removeEventListener('load', onLoad);
			resolve(img);
		}

		/** @param {Event} error */
		function onError(error) {
			img.removeEventListener('load', onLoad);
			img.removeEventListener('error', onError);
			reject(error);
		}

		img.addEventListener('load', onLoad);
		img.addEventListener('error', onError);

		img.src = url;
	});
}
