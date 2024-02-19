import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { build as viteBuild } from 'vite';
import { yellow } from 'kleur/colors';
import * as p from '@clack/prompts';
import { createFragmentFile } from './createFragmentFile.js';
import { getEntries } from './getEntries.js';
import { createConfig } from './createConfig.js';
import { log } from './log.js';
import { handleCancelledPrompt, mkdirp } from './utils.js';

/**
 * Build a sketch into static files
 * @param {string} entry
 * @param {object} options
 * @param {string} options.base
 * @param {string} options.outDir
 * @param {boolean} options.emptyOutDir
 * @param {boolean} options.development
 */
export async function build(entry, options) {
	const cwd = process.cwd();

	try {
		p.intro(`Welcome to Fragment`);

		const entries = await getEntries(entry, cwd);

		const outDir = await p.text({
			message: 'Specify the output directory (relative to project root)',
			placeholder: '.  (hit Enter to use current directory)',
			initialValue:
				options.outDir ?? entries[0].split(path.extname(entries[0]))[0],
		});

		handleCancelledPrompt(outDir);

		let outDirPath = path.join(cwd, outDir);

		// create directory if it doesn't exist
		mkdirp(outDirPath);

		const files = await readdir(outDirPath);

		let emptyOutDir = options.emptyOutDir ?? true;

		if (files.length > 0) {
			p.log.warn(yellow(`${outDirPath} is not an empty folder.`));

			emptyOutDir = await p.confirm({
				message: 'Empty folder before building ?',
				active: 'Yes',
				inactive: 'No',
				initialValue: emptyOutDir ?? true,
			});

			handleCancelledPrompt(emptyOutDir);
		}

		const base = await p.text({
			message: 'Base public path',
			placeholder: `/ (Hit Enter to validate)`,
			initialValue: options.base,
		});

		if (entries.length > 0) {
			const fragmentFilepath = await createFragmentFile(entries, cwd);
			const config = createConfig(
				entries,
				fragmentFilepath,
				{
					dev: options.development,
					build: true,
				},
				undefined,
				cwd,
			);

			if (entries.length > 1) {
				log.error(`fragment can only build one sketch at a time.`);
				return;
			}

			await viteBuild({
				...config,
				logLevel: 'info',
				base,
				build: {
					outDir: outDirPath,
					emptyOutDir,
				},
			});

			log.success(`Built files for:`);
			entries.forEach((entry) => console.log(`- ${entry}`));
		}
	} catch (error) {
		console.log(error);
	}
}
