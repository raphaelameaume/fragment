export function loadImage(url, { id = url, img = new Image() } = {}) {
	return new Promise((resolve, reject) => {
		function onLoad() {
			img.removeEventListener('load', onLoad);
			resolve(img);
		}

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
