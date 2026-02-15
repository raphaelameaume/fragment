/*
https://github.com/mattdesl/canvas-sketch/blob/24f6bb2bbdfdfd72a698a0b8a0962ad843fb7688/lib/save.js
*/

import { VIDEO_FORMATS } from '../state/exports.svelte';
import GIFRecorder from '../lib/canvas-recorder/GIFRecorder';
import FrameRecorder from '../lib/canvas-recorder/FrameRecorder';
import MediaBunnyRecorder from '../lib/canvas-recorder/MediaBunnyRecorder';
import { exportCanvas } from '../lib/canvas-recorder/utils';
import { map } from './math.utils';
import { createDataURLFromBlob, saveFiles } from './file.utils';

/**
 * @typedef {Object} FilenameParams
 * @property {string} year - Four-digit year
 * @property {string} month - Two-digit month
 * @property {string} day - Two-digit day
 * @property {string} hours - Two-digit hours
 * @property {string} minutes - Two-digit minutes
 * @property {string} seconds - Two-digit seconds
 * @property {string} timestamp - Full timestamp string
 */

/**
 * @typedef {Object} ScreenshotOptions
 * @property {string} [filename='Screenshot'] - Base filename
 * @property {number} [index] - Optional frame index
 * @property {FilenamePattern} [pattern] - Filename pattern function
 * @property {string} [exportDir] - Export directory path
 * @property {Record<string, any>} [params={}] - Additional parameters for pattern
 * @property {string} [encoding='png'] - Image encoding format
 * @property {number} [quality=100] - Image quality (1-100)
 * @property {number} [pixelsPerInch=72] - Image DPI
 */

/**
 * @typedef {Object} RecordCanvasOptions
 * @property {string} [filename='output'] - Base filename for output
 * @property {string} [format='mp4'] - Output format
 * @property {number} [framerate=25] - Frames per second
 * @property {number} [duration=Infinity] - Recording duration in seconds
 * @property {number} [quality=100] - Recording quality (1-100)
 * @property {FilenamePattern} [pattern] - Filename pattern function
 * @property {import('../lib/canvas-recorder/MediaBunnyRecorder').VideoCodec} [codec] - Video codec
 * @property {string} [exportDir] - Export directory path
 * @property {string} [imageEncoding] - Image encoding for frame exports
 * @property {import('../lib/canvas-recorder/CanvasRecorder').CanvasRecorderStartCallback} [onStart] - Callback when recording starts
 * @property {import('../lib/canvas-recorder/CanvasRecorder').CanvasRecorderTickCallback} [onTick] - Callback on each frame
 * @property {import('../lib/canvas-recorder/CanvasRecorder').CanvasRecorderCompleteCallback} [onComplete] - Callback when recording completes
 * @property {Record<string, any>} [params={}] - Additional parameters
 */
/**
 * @typedef {Object} PatternParams
 * @property {number} [index] - Frame or sequence index
 * @property {string} filename - Base filename
 * @property {string} timestamp - Timestamp string
 */

/**
 * @callback FilenamePattern
 * @param {PatternParams & Record<string, any>} params - Pattern parameters
 * @returns {string} Generated filename
 */

/**
 * Get current date/time parameters for filename generation
 * @returns {FilenameParams}
 */
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

/**
 * Default filename pattern generator
 * @type {FilenamePattern}
 */
export const defaultFilenamePattern = ({ index, filename, timestamp }) => {
	let name = `${filename}.${timestamp}`;

	if (typeof index === 'number' && !isNaN(index)) {
		name += `-${index}`;
	}

	return name;
};

/**
 * Capture and save a screenshot of a canvas
 * @param {HTMLCanvasElement} canvas - The canvas to capture
 * @param {ScreenshotOptions} [options={}] - Screenshot options
 * @returns {Promise<void>}
 */
export async function screenshotCanvas(
	canvas,
	{
		filename = 'Screenshot',
		index,
		pattern = defaultFilenamePattern,
		exportDir,
		params = {},
		encoding = 'png',
		quality = 100,
		pixelsPerInch = 72,
	} = {},
) {
	let { extension, dataURL } = exportCanvas(canvas, {
		encoding: `image/${encoding}`,
		encodingQuality: map(quality, 1, 100, 0, 1),
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

/**
 * Record video using MediaBunny recorder
 * @param {HTMLCanvasElement} canvas - The canvas to record
 * @param {import('../lib/canvas-recorder/MediaBunnyRecorder').MediaBunnyRecorderOptions} options - Recording options
 * @returns {MediaBunnyRecorder}
 */
function record(canvas, options) {
	let recorder = new MediaBunnyRecorder(canvas, options);
	recorder.start();

	return recorder;
}

/**
 * Record GIF animation
 * @param {HTMLCanvasElement} canvas - The canvas to record
 * @param {import('../lib/canvas-recorder/CanvasRecorder').CanvasRecorderOptions} options - Recording options
 * @returns {GIFRecorder}
 */
function recordGIF(canvas, options) {
	let recorder = new GIFRecorder(canvas, options);
	recorder.start();

	return recorder;
}

/**
 * Record individual frames
 * @param {HTMLCanvasElement} canvas - The canvas to record
 * @param {import('../lib/canvas-recorder/FrameRecorder').FrameRecorderOptions} options - Recording options
 * @returns {FrameRecorder}
 */
function recordFrames(canvas, options) {
	let recorder = new FrameRecorder(canvas, options);
	recorder.start();

	return recorder;
}

/**
 * Start recording canvas output
 * @param {HTMLCanvasElement} canvas - The canvas to record
 * @param {RecordCanvasOptions} [options={}] - Recording options
 * @returns {MediaBunnyRecorder | GIFRecorder | FrameRecorder | undefined}
 */
export function recordCanvas(
	canvas,
	{
		filename = 'output',
		format = 'mp4',
		framerate = 25,
		duration = Infinity,
		quality = 100,
		pattern = defaultFilenamePattern,
		codec = 'avc',
		exportDir,
		imageEncoding,
		onStart = () => {},
		onTick = () => {},
		onComplete = () => {},
	} = {},
) {
	let patternParams = getFilenameParams();
	let name = pattern({ filename, ...patternParams });

	/**
	 * Handle recording completion
	 * @param {Blob | Blob[] | null} result - Recording result (blob or array of blobs)
	 * @returns {Promise<void>}
	 */
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
					blob,
					exportDir,
					encoding: 'base64',
				});
			}
		} else if (result) {
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
		onComplete(result);
	}

	const options = {
		framerate,
		format,
		duration,
		quality,
		onStart,
		onTick,
		onComplete: complete,
	};

	let recorder;

	if (
		[
			VIDEO_FORMATS.MKV,
			VIDEO_FORMATS.MOV,
			VIDEO_FORMATS.MP4,
			VIDEO_FORMATS.WEBM,
		].includes(format)
	) {
		recorder = record(canvas, {
			...options,
			codec,
		});
	} else if (format === VIDEO_FORMATS.GIF) {
		recorder = recordGIF(canvas, options);
	} else if (format === VIDEO_FORMATS.FRAMES) {
		recorder = recordFrames(canvas, {
			...options,
			imageEncoding,
		});
	}

	if (!recorder) {
		console.error(`Cannot find matching recorder`);
	}

	return recorder;
}
