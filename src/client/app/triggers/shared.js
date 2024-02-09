export const wildcard = '*';
export let sketchFiles = [];

export function assignSketchFiles(files) {
	sketchFiles.push(...files);
}

export function getContext() {
	let context;

	const { stack } = new Error();
	const { url } = import.meta;

	const callstack = stack.split('\n');
	const index = callstack.findIndex((call) => call.includes(url));

	if (index >= 0) {
		callstack.splice(0, index + 1);
	}

	for (let i = 0; i < callstack.length; i++) {
		for (let j = 0; j < sketchFiles.length; j++) {
			const sketchFile = sketchFiles[j];

			if (callstack[i].includes(sketchFile)) {
				context = sketchFile;
				break;
			}
		}
	}

	if (!context) {
		context = wildcard;
	}

	return context;
}
