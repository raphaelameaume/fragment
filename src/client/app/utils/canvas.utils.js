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
 *
 * @param {HTMLCanvasElement} canvas
 * @param {object} options
 * @param {number} [options.index]
 * @param {string} [options.encoding='png']
 * @param {number} [options.quality=100]
 * @param {number} [options.pixelsPerInch=72]
 * @param {string} [options.name='Screenshot']
 * @param {string} [options.exportDir]
 * @param {object} [options.params={}]
 * @param {Promise<string[]>}
 */
export async function screenshotCanvas(
	canvas,
	{
		index,
		encoding = 'png',
		quality = 100,
		pixelsPerInch = 72,
		name = 'Screenshot',
		exportDir,
		params = {},
	} = {},
) {
	let { extension, dataURL } = exportCanvas(canvas, {
		encoding: `image/${encoding}`,
		encodingQuality: map(quality, 1, 100, 0, 1),
		pixelsPerInch,
	});

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

function record(canvas, options) {
	let recorder = new MediaBunnyRecorder(canvas, options);
	recorder.start();

	return recorder;
}

function recordGIF(canvas, options) {
	let recorder = new GIFRecorder(canvas, options);
	recorder.start();

	return recorder;
}

function recordFrames(canvas, options) {
	let recorder = new FrameRecorder(canvas, options);
	recorder.start();

	return recorder;
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {object} options
 * @param {string} [options.format='mp4']
 * @param {number} [options.framerate=25]
 * @param {number} [options.duration=Infinity]
 * @param {number} [options.quality=100]
 * @param {string} [options.codec]
 * @param {string} [options.imageEncoding]
 * @param {string} [options.name='Record']
 * @param {string} [options.exportDir]
 * @param {object} [options.params={}]
 * @param {function} [options.onStart]
 * @param {function} [options.onTick]
 * @param {function} [options.onComplete]
 * @param {Promise<string[]>}
 */
export function recordCanvas(
	canvas,
	{
		format = 'mp4',
		framerate = 25,
		duration = Infinity,
		quality = 100,
		codec,
		imageEncoding,
		name = 'Record',
		exportDir,
		params = {},
		onStart = () => {},
		onTick = () => {},
		onComplete = () => {},
	} = {},
) {
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
