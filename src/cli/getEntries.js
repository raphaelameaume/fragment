import path from 'node:path';
import fs from 'node:fs';
import { lstat, readdir } from 'node:fs/promises';
import { bold, cyan, log } from './log.js';
import * as p from './prompts.js';
import { addExtension } from './utils.js';

/**
 * Build entries from entry filepath or folder path
 * @param {string} entry
 * @param {string} cwd - Current working directory
 * @returns {string[]}
 */
export async function getEntries(
	entry,
	cwd = process.cwd(),
	command,
	prefix = log.prefix(command),
) {
	const displayCommand = (message) => {
		p.note(bold(cyan(message)));
	};

	const onError = (message) => {
		log.error(`Error\n`, prefix);
		log.warn(message);
	};

	try {
		const entries = [];

		if (!entry) {
			onError(`You need to specify a file to start Fragment.\n`);
			displayCommand(
				`fragment${command === 'build' ? ' build' : ''} [your-file].js`,
			);
			return entries;
		}

		const entryPath = path.join(cwd, entry);

		if (fs.existsSync(entryPath)) {
			const stats = await lstat(entryPath);

			if (stats.isFile()) {
				entries.push(path.relative(cwd, entryPath));
			} else if (stats.isDirectory()) {
				const files = await readdir(entryPath);
				const sketchFiles = files
					.filter((file) => path.extname(file) === '.js')
					.map((file) => path.join(entryPath, file));

				if (sketchFiles.length > 0) {
					entries.push(
						...sketchFiles.map((sketchFile) =>
							path.relative(cwd, sketchFile),
						),
					);
				} else {
					onError(`Folder doesn't contain any sketch files.`);
				}
			}
		} else {
			onError(`${path.join(cwd, entry)} does not exist.\n`);

			const entryWithExt = addExtension(entry, '.js');
			const fileExists = fs.existsSync(path.join(cwd, entryWithExt));

			if (fileExists) {
				log.message(`Did you mean to type?\n`);

				displayCommand(`fragment ${entryWithExt}`);
			} else {
				log.message(
					`Run the following command to start a new sketch:\n`,
				);
				displayCommand(`fragment ${entryWithExt} --new`);
			}
		}

		return entries;
	} catch (error) {
		throw error;
	}
}
