import { loadImage } from './loadImage';

function getFileExtension(path) {
	return path.match(/[^\\/]\.([^.\\/]+)$/);
}

function getLoader(extension) {
	if (['jpeg', 'jpg', 'gif', 'png', 'webp'].includes(extension)) {
		return loadImage;
	}

	return () => {};
}

export function load(url, options = { id: url }) {
	const extension = getFileExtension(url);
	const loader = options.loader || getLoader(extension);

	return loader(url, options);
}
