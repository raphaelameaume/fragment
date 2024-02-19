import path from 'node:path';
import { lstat, readdir } from 'node:fs/promises';
import { log } from './log.js';

/**
 * Build entries from entry filepath or folder path
 * @param {string} entry
 * @param {string} cwd - Current working directory
 * @returns {string[]}
 */
export async function getEntries(entry, cwd = process.cwd()) {
	const entryPath = path.join(cwd, entry);
	const entries = [];

	try {
		const stats = await lstat(entryPath);

		if (stats.isFile()) {
			entries.push(path.relative(cwd, entryPath));
		} else if (stats.isDirectory()) {
			const files = await readdir(entryPath);
			const sketchFiles = files.filter(
				(file) => path.extname(file) === '.js',
			);

			if (sketchFiles.length === 0) {
				log.error(`Folder doesn't contain any sketch files.`);
				return;
			}

			entries.push(
				...sketchFiles.map((sketchFile) =>
					path.relative(cwd, sketchFile),
				),
			);
		}
	} catch (error) {
		if (error.code === 'ENOENT') {
			log.error(`Error: ${entry} doesn't exist.`);
		} else {
			log.error(error.message);
		}
	}

	return entries;
}
