import { getFileExtension, getFilename } from '../utils/file.utils';

export const wildcard = '*';
/** @type string[] */
export let sketchFiles = [];

/**
 * @param {string[]} files
 */
export function assignSketchFiles(files) {
	sketchFiles.push(...files);
}

/**
 * Retrieves sketch key based on error stack traces
 * @returns {string}
 */
export function getContext() {
	let context = wildcard;

	const { stack } = new Error();
	const { url } = import.meta;

	if (stack) {
		const callstack = stack.split('\n');
		const index = callstack.findIndex((call) => call.includes(url));

		if (index >= 0) {
			callstack.splice(0, index + 1);
		}

		for (let i = 0; i < callstack.length; i++) {
			for (let j = 0; j < sketchFiles.length; j++) {
				const sketchFile = getFilename(sketchFiles[j]);
				const extension = getFileExtension(sketchFile);
				const filename = sketchFile.split(`.${extension}`)[0];

				if (callstack[i].includes(filename)) {
					context = sketchFile;
					break;
				}
			}
		}
	}

	return context;
}
