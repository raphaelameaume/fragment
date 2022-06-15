export function download(data, filename) {
	let extension = getFileExtension(filename);

	if (typeof data === "object" && ["json", "txt"].includes(extension)) {
        data = JSON.stringify(data, undefined, 4);
    }

	let type = getMimeType(extension);
	let blob = new Blob([data], { type });

	downloadBlob(blob, { filename });
}

export function downloadBlob(blob, { filename = "untitled" } = {}) {
	let a = document.createElement('a');
	a.style.visibility = 'hidden';
    a.target = '_blank';

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    // a.dataset.downloadurl =  [type, a.download, a.href].join(':');

	a.onclick = () => {
		a.onclick = () => {};
		setTimeout(() => {
			window.URL.revokeObjectURL(blob);
			if (a.parentElement) a.parentElement.removeChild(a);
			a.removeAttribute('href');
		});
	};

    a.click();
}

export function getFileExtension(path) {
	const match = path.match(/[^\\/]\.([^.\\/]+)$/);

	if (match && match.length > 1) {
		return match[1];
	}
}

/**
 * 
 * @param {string} extension 
 * @returns {string} mimeType
 */
export function getMimeType(extension) {
	if (extension === "json") return "application/json";
	if (extension === "txt") return "text";
	if (extension === "png") return "image/png";
	if (extension === "jpeg" || extension === "jpg") return "image/jpeg";
}
