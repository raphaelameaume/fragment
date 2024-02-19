import { build as viteBuild } from 'vite';
import path from 'node:path';
import { createFragmentFile } from './createFragmentFile.js';
import { getEntries } from './getEntries.js';
import { createConfig } from './createConfig.js';
import { log } from './log.js';

/**
 *
 * @param {string} entry
 * @param {object} options
 * @param {string} options.outDir
 * @param {string} options.base
 * @param {boolean} options.development
 * @param {boolean} options.emptyOutDir
 */
export async function build(entry, options) {
	const cwd = process.cwd();

	try {
		const entries = await getEntries(entry, cwd);

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

			const outDir = options.outDir ?? entries[0].split('.js')[0];

			await viteBuild({
				...config,
				logLevel: 'info',
				base: options.base,
				build: {
					// commonjsOptions: {
					// 	include: ['convert-length', 'webm-writer', 'changedpi'],
					// },
					outDir: path.join(cwd, outDir),
					emptyOutDir: options.emptyOutDir,
				},
			});

			log.success(`Built files for:`);
			entries.forEach((entry) => console.log(`- ${entry}`));
		}
	} catch (error) {
		console.log(error);
	}
}
