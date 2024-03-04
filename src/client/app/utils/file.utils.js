/**
 * @typedef {Object} File
 * @property {string} filepath
 * @property {string} exportDir
 * @property {string} data
 * @property {string} [encoding]
 */

/**
 * Transform a Blob into a Data URL
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export async function createDataURLFromBlob(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onerror = (err) => {
			reject(err);
		};

		reader.onload = (e) => {
			resolve(e.target.result);
		};

		reader.readAsDataURL(blob);
	});
}

/**
 * Transform a Data URL into a blob
 * @param {string} dataURL
 * @returns {Blob}
 */
export function createBlobFromDataURL(dataURL) {
	return new Promise((resolve, reject) => {
		const splitIndex = dataURL.indexOf(',');

		if (splitIndex === -1) {
			reject(
				new Error(
					`createBlobFromDataURL: dataURL doesn't contain extension data.`,
				),
			);
			return;
		}

		const base64 = dataURL.slice(splitIndex + 1);
		const byteString = window.atob(base64);
		const type = dataURL.slice(0, splitIndex);
		const mimeMatch = /data:([^;]+)/.exec(type);
		const mime = (mimeMatch ? mimeMatch[1] : '') || undefined;
		const ab = new ArrayBuffer(byteString.length);
		const ia = new Uint8Array(ab);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		resolve(new window.Blob([ab], { type: mime }));
	});
}

export function download(data, filename) {
	let extension = getFileExtension(filename);

	if (typeof data === 'object' && ['json', 'txt'].includes(extension)) {
		data = JSON.stringify(data, undefined, 4);
	}

	let type = getMimeType(extension);
	let blob = new Blob([data], { type });

	downloadBlob(blob, { filename });
}

/**
 * Download a blob from the browser
 * @param {Blob} blob
 * @param {object} [options]
 * @param {string} [options.filename="untitled"]
 */
export function downloadBlob(blob, { filename = 'untitled' } = {}) {
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

/**
 * Extract filename and extension from a string path
 * @param {string} path
 * @returns {string} filename
 */
export function getFilename(path) {
	return path.split(/[\\/]/).pop();
}

/**
 * Estimate file size in megabytes from a Data URL
 * @param {string} data
 * @returns {number}
 */
export function estimateFileSize(data) {
	const base64Length = data.length - (data.indexOf(',') + 1);
	return (base64Length * (3 / 4) - 2) / 1024 / 1024;
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
 * @returns {string}
 */
export function getMimeType(extension) {
	if (extension === 'json') return 'application/json';
	if (extension === 'txt') return 'text';
	if (extension === 'png') return 'image/png';
	if (extension === 'jpeg' || extension === 'jpg') return 'image/jpeg';
}

/**
 *
 * @param {File|File[]} files
 */
export async function saveInBrowser(files) {
	/**
	 * @param {File} file
	 */
	async function saveFile({ filename, data, blob }) {
		if (!blob) {
			blob = await createBlobFromDataURL(data);
		}

		await downloadBlob(blob, { filename });
	}

	if (Array.isArray(files)) {
		return Promise.all(files.map((file) => saveFile(file)));
	} else {
		await saveFile(files);
	}
}

/**
 * Save files to disk by sending them to Fragment save plugin. Fallback to saveInBrowser if fails
 * @param {File[]} files
 * @returns {Promise<string[]>}
 */
export async function saveFiles(files = [], out = []) {
	if (__DEV__) {
		files.forEach((file) => {
			if (!file.size) {
				file.size = estimateFileSize(file.data);
			}
		});

		const limitInMb = 100;
		const body = {
			files: [],
		};

		let size = 0;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (size < limitInMb) {
				body.files.push(file);
				size += file.size;
			} else {
				break;
			}
		}

		const response = await fetch('/save', {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});
		const { filepaths, error } = await response.json();

		if (response.ok && filepaths?.length) {
			out.push(...filepaths);

			if (body.files.length < files.length) {
				return saveFiles(files.slice(body.files.length), out);
			}

			if (out.length < 15) {
				out.forEach((filepath) => {
					console.log(`[fragment] Saved ${filepath}`);
				});
			} else {
				console.log(`[fragment] Saved ${filepaths.length} files.`, {
					filepaths: out,
				});
			}

			return out;
		} else {
			console.error(`[fragment] Error while saving files on disk.`);
			await saveInBrowser(files);
		}
	} else {
		await saveInBrowser(files);
	}
}

/**
 * Save a blob on disk
 * @param {Blob} blob
 * @param {object} options
 * @returns {Promise<string[]>}
 */
export async function saveBlob(blob, { filename, exportDir }) {
	const data = await createDataURLFromBlob(blob);

	return saveFiles([
		{
			filename,
			data,
			exportDir,
			encoding: 'base64',
		},
	]);
}
