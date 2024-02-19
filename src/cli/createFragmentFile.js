import { writeFile } from 'node:fs/promises';
import path, { sep, posix } from 'node:path';
import { mkdirp } from './utils.js';
import { log } from './log.js';

/**
 * Create local files needed by Fragment
 * @param {string[]} entries
 * @param {string} cwd Current working directory
 * @returns {string}
 */
export async function createFragmentFile(entries = [], cwd = process.cwd()) {
	try {
		function getFilenameFromEntries(entries) {
			if (entries.length === 1) {
				const filename = path.parse(entries[0]).name;

				return `${filename}.js`;
			}

			return `sketches.js`;
		}

		log.text(`Building files for:`);
		entries.forEach((entry) => console.log(`- ${entry}`));

		const dir = '/node_modules/.fragment';
		const dirpath = path.join(cwd, dir);
		const filename = getFilenameFromEntries(entries);
		const filepath = path.join(dirpath, filename);

		// generate sketch index file
		const code = /* js */ `
// This file is generated by Fragment. Do not edit it.

export const sketches = {
    ${entries
		.map((entry) => {
			const entryPath = entry.split(sep).join(posix.sep);
			const relativeEntryPath = `../../${entry}`
				.split(sep)
				.join(posix.sep);

			return `"${entryPath}": () => import("${relativeEntryPath}")`;
		})
		.join(',')}
};

export const onSketchReload = (fn) => {
    if (import.meta.hot) {
        import.meta.hot.data.onSketchChange = fn;
    }
};

if (import.meta.hot) {
    import.meta.hot.accept((m) => {
        if (typeof import.meta.hot.data.onSketchChange === "function") {
            import.meta.hot.data.onSketchChange(m);
        }
    });
}
`;

		await mkdirp(dirpath);
		await writeFile(filepath, code);

		return filepath;
	} catch (error) {
		throw error;
	}
}
