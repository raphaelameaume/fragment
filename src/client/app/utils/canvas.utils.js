/*
https://github.com/mattdesl/canvas-sketch/blob/24f6bb2bbdfdfd72a698a0b8a0962ad843fb7688/lib/save.js
*/

import { get } from 'svelte/store';
import { exports } from '../stores';
import { VIDEO_FORMATS } from '../stores/exports';
import {
	downloadBlob,
	createBlobFromDataURL,
	estimateFileSize,
} from './file.utils';
import WebMRecorder from '../lib/canvas-recorder/WebMRecorder';
import MP4Recorder from '../lib/canvas-recorder/MP4Recorder';
import GIFRecorder from '../lib/canvas-recorder/GIFRecorder';
import FrameRecorder from '../lib/canvas-recorder/FrameRecorder';
import { exportCanvas } from '../lib/canvas-recorder/utils';
import { map } from './math.utils';

/**
 * @typedef {Object} File
 * @property {string} filepath
 * @property {string} exportDir
 * @property {string} data
 * @property {string} [encoding]
 */

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
 * Save files to disk by sending them to Fragment save plugin. Fallbacks to saveInBrowser if
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
				out.log(`[fragment] Saved ${filepaths.length} files.`, {
					filepaths: out,
				});
			}

			return out;
		} else {
			throw new Error(error);
		}
	} else {
		await saveInBrowser(files);
	}
}

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

function getFilenameParams() {
	const now = new Date();

	const year = now.toLocaleString('default', { year: 'numeric' });
	const month = now
		.toLocaleString('default', { month: 'numeric' })
		.padStart(2, `0`);
	const day = now
		.toLocaleString('default', { day: 'numeric' })
		.padStart(2, '0');
	const hours = now
		.toLocaleString('default', { hour: 'numeric', hour12: false })
		.split(' ')[0];
	const minutes = now
		.toLocaleString('default', { minute: 'numeric' })
		.padStart(2, `0`);
	const seconds = now
		.toLocaleString('default', { second: 'numeric' })
		.padStart(2, `0`);

	const timestamp = `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;

	return {
		year,
		month,
		day,
		hours,
		minutes,
		seconds,
		timestamp,
	};
}

export const defaultFilenamePattern = ({ index, filename, timestamp }) => {
	let name = `${filename}.${timestamp}`;

	if (!isNaN(index)) {
		name += `-${index}`;
	}

	return name;
};

export function createFilename({
	name,
	index,
	extension = '',
	pattern = defaultFilenamePattern,
	...params
}) {
	let patternParams = getFilenameParams();
	let filename = pattern({
		filename: name,
		index,
		...params,
		...patternParams,
	});

	return `${filename}${extension}`;
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} sketchKey
 * @param {Sketch} sketch
 * @param {number} [index]
 * @param {Promise<string[]>}
 */
export async function screenshotCanvas(
	canvas,
	{
		filename = '',
		index,
		pattern = defaultFilenamePattern,
		exportDir,
		params = {},
	},
) {
	const { imageEncoding, imageQuality, pixelsPerInch } = get(exports);
	let { extension, dataURL } = exportCanvas(canvas, {
		encoding: `image/${imageEncoding}`,
		encodingQuality: map(imageQuality, 1, 100, 0, 1),
		pixelsPerInch,
	});

	let patternParams = getFilenameParams();
	let name = pattern({ filename, index, ...params, ...patternParams });

	const files = [
		{
			filename: `${name}${extension}`,
			exportDir,
			data: dataURL,
			encoding: 'base64',
		},
	];

	try {
		await saveFiles(files);
	} catch (error) {
		console.error(`[fragment] Error while saving screenshot.`);
		console.log(error);
	}
}

function recordCanvasWebM(canvas, options) {
	let recorder = new WebMRecorder(canvas, options);
	recorder.start();

	return recorder;
}

function recordCanvasMp4(canvas, options) {
	let recorder = new MP4Recorder(canvas, options);
	recorder.start();

	return recorder;
}

function recordCanvasGIF(canvas, options) {
	let recorder = new GIFRecorder(canvas, options);
	recorder.start();

	return recorder;
}

function recordCanvasFrames(canvas, options) {
	let recorder = new FrameRecorder(canvas, options);
	recorder.start();

	return recorder;
}

export function recordCanvas(
	canvas,
	{
		filename = 'output',
		format = 'mp4',
		framerate = 25,
		duration = Infinity,
		quality = 100,
		pattern = defaultFilenamePattern,
		exportDir,
		imageEncoding,
		onStart = () => {},
		onTick = () => {},
		onComplete = () => {},
		params = {},
	} = {},
) {
	let patternParams = getFilenameParams();
	let name = pattern({ filename, ...patternParams });

	async function complete(result) {
		const files = [];

		if (Array.isArray(result)) {
			const frmt =
				format === VIDEO_FORMATS.FRAMES ? imageEncoding : format;

			for (let i = 0; i < result.length; i++) {
				const index = `${i}`.padStart(`${result.length}`.length, '0');
				const filename = `${name}-${index}.${frmt}`;
				const blob = result[i];
				const data = await createDataURLFromBlob(blob);

				files.push({
					filename,
					data,
					blob: exportDir,
					encoding: 'base64',
				});
			}
		} else {
			const blob = result;
			const data = await createDataURLFromBlob(blob);

			files.push({
				filename: `${name}.${format}`,
				data,
				blob,
				encoding: 'base64',
				exportDir,
			});
		}

		await saveFiles(files);
		onComplete();
	}

	const options = {
		framerate,
		duration,
		quality,
		onStart,
		onTick,
		onComplete: complete,
	};

	let recorder;

	if (format === VIDEO_FORMATS.WEBM) {
		recorder = recordCanvasWebM(canvas, options);
	} else if (format === VIDEO_FORMATS.MP4) {
		recorder = recordCanvasMp4(canvas, options);
	} else if (format === VIDEO_FORMATS.GIF) {
		recorder = recordCanvasGIF(canvas, options);
	} else if (format === VIDEO_FORMATS.FRAMES) {
		recorder = recordCanvasFrames(canvas, {
			...options,
			imageEncoding,
		});
	}

	if (!recorder) {
		console.error(`Cannot find matching recorder`);
	}

	return recorder;
}
