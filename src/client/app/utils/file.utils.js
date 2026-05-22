/**
 * @typedef {Object} File
 * @property {string} filename
 * @property {string} data
 * @property {string} [exportDir]
 * @property {string} [encoding]
 * @property {Blob} [blob]
 * @property {number} [size]
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
			const result = e.target?.result;
			if (typeof result === 'string') {
				resolve(result);
			} else {
				reject(new Error('Failed to read blob as data URL'));
			}
		};

		reader.readAsDataURL(blob);
	});
}

/**
 * Transform a Data URL into a blob
 * @param {string} dataURL
 * @returns {Promise<Blob>}
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

/**
 * Download data as a file
 * @param {string | object} data - The data to download
 * @param {string} filename - The filename for the download
 * @returns {void}
 */
export function download(data, filename) {
	let extension = getFileExtension(filename);

	let content;
	if (typeof data === 'object') {
		content = JSON.stringify(data, undefined, 4);
	} else {
		content = data;
	}

	let type = getMimeType(extension);
	let blob = new Blob([content], { type });

	downloadBlob(blob, { filename });
}

/**
 * Download a blob from the browser
 * @param {Blob} blob
 * @param {object} [options]
 * @param {string} [options.filename="untitled"]
 * @returns {void}
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
			window.URL.revokeObjectURL(a.href);
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
	return path.split(/[\\/]/).pop() || path;
}

/**
 * Estimate file size in megabytes from a Data URL
 * @param {string} data
 * @returns {number}
 */
export function estimateFileSize(data, errorMargin = 1) {
	const base64Length = data.length - (data.indexOf(',') + 1);
	return ((base64Length * (3 / 4) - 2) / 1024 / 1024) * errorMargin;
}

/**
 * Extract file extension from a path
 * @param {string} path - The file path
 * @returns {string} The file extension or undefined if not found
 */
export function getFileExtension(path) {
	const match = path.match(/[^\\/]\.([^.\\/]+)$/);

	if (match && match.length > 1) {
		return match[1];
	}

	return '';
}

/**
 * Get MIME type from file extension
 * @param {string} extension - The file extension
 * @returns {string} The MIME type or 'application/octet-stream' if not recognized
 */
export function getMimeType(extension) {
	if (extension === 'json') return 'application/json';
	if (extension === 'txt') return 'text';
	if (extension === 'png') return 'image/png';
	if (extension === 'jpeg' || extension === 'jpg') return 'image/jpeg';

	return 'application/octet-stream';
}

/**
 * Save file(s) in the browser using download
 * @param {File | File[]} files - Single file or array of files to save
 * @returns {Promise<void>}
 */
export async function saveInBrowser(files) {
	/**
	 * @param {File} file
	 */
	async function saveFile({ filename, data, blob }) {
		if (!blob) {
			blob = await createBlobFromDataURL(data);
		}

		downloadBlob(blob, { filename });
	}

	if (Array.isArray(files)) {
		await Promise.all(files.map((file) => saveFile(file)));
	} else {
		await saveFile(files);
	}
}

/**
 * Save files to disk by sending them to Fragment save plugin. Fallback to saveInBrowser if fails
 * @param {File[]} [files=[]]
 * @param {string[]} [out=[]]
 * @returns {Promise<string[] | void>}
 */
export async function saveFiles(files = [], out = [], { commit = false } = {}) {
	if (__DEV__) {
		files.forEach((file) => {
			if (!file.size) {
				const errorMargin = 1.3;
				file.size = estimateFileSize(file.data, errorMargin);
			}
		});

		const limitInMb = 100;
		/** @type {{ files: File[], commit: boolean }} */
		const body = {
			files: [],
			commit: false,
		};

		let size = 0;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];

			if (size + (file.size ?? 0) < limitInMb) {
				body.files.push(file);
				size += file.size || 0;
			} else {
				break;
			}
		}

		const isLastBatch = body.files.length - files.length === 0;

		if (isLastBatch) {
			body.commit = commit;
		}

		const response = await fetch('/save', {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});
		/** @type {{ filepaths: string[], warnings: string[], errors: string[]}} */
		const { filepaths, warnings, errors } = await response.json();

		if (errors?.length > 0) {
			errors.forEach((error) => {
				console.error(`[fragment] ${error}`);
			});
			await saveInBrowser(files);
		} else if (response.ok && filepaths?.length) {
			out.push(...filepaths);

			if (body.files.length < files.length) {
				return saveFiles(files.slice(body.files.length), out, {
					commit,
				});
			}

			if (out.length < 15) {
				out.forEach((filepath) => {
					console.log(`[fragment] Saved ${filepath}`);
				});
			} else {
				console.log(`[fragment] Saved ${out.length} files.`, {
					filepaths: out,
				});
			}

			if (warnings?.length > 0) {
				warnings.forEach((warning) => {
					console.warn(`[fragment] ${warning}`);
				});
			} else {
				if (commit) {
					console.log(`[fragment] Committed latest changes.`);
				}
			}

			return out;
		}
	} else {
		await saveInBrowser(files);
	}
}

/**
 * Save a blob on disk
 * @param {Blob} blob
 * @param {object} options
 * @param {string} options.filename
 * @param {string} options.exportDir
 * @returns {Promise<string[] | void>}
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
