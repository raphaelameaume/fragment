import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { mergeConfig, build as viteBuild } from 'vite';
import { createFragmentFile } from './createFragmentFile.js';
import { createConfig } from './createConfig.js';
import { getEntries } from './getEntries.js';
import { log, magenta } from './log.js';
import * as p from './prompts.js';
import { handleCancelledPrompt, mkdirp, prettifyTime } from './utils.js';
import hotShaderReplacement from './plugins/hot-shader-replacement.js';

/**
 * Build a sketch for production
 * @param {string} entry
 * @param {object} options
 * @param {string} options.base
 * @param {string} options.outDir
 * @param {boolean} options.emptyOutDir
 * @param {boolean} options.development
 */
export async function build(entry, options) {
	const cwd = process.cwd();
	const prefix = log.prefix('build');

	try {
		log.message(`${magenta(entry)}\n`, prefix);

		const entries = await getEntries(entry, cwd);

		const outDir = await p.text({
			message: 'Output directory:',
			placeholder: '.',
			hint: '(hit Enter to use current directory)',
			initialValue:
				options.outDir ?? entries[0].split(path.extname(entries[0]))[0],
		});

		handleCancelledPrompt(outDir, prefix);

		let outDirPath = path.join(cwd, outDir);

		// create directory if it doesn't exist
		mkdirp(outDirPath);

		const files = await readdir(outDirPath);

		let emptyOutDir = options.emptyOutDir ?? true;

		if (files.length > 0) {
			log.warn(`${outDirPath} is not an empty folder.\n`);

			emptyOutDir = await p.confirm({
				message: 'Empty folder before building?',
				active: 'Yes',
				inactive: 'No',
				initialValue: emptyOutDir ?? true,
			});

			handleCancelledPrompt(emptyOutDir, prefix);
		}

		const base = await p.text({
			message: 'Base public path:',
			placeholder: `/`,
			hint: '(Hit Enter to validate)',
			initialValue: options.base,
		});

		handleCancelledPrompt(base, prefix);

		if (entries.length > 0) {
			log.message(
				`Building ${magenta(entries[0])} for production...\n`,
				prefix,
			);

			const fragmentFilepath = await createFragmentFile(entries, cwd);
			const config = createConfig(
				entries,
				fragmentFilepath,
				{
					dev: options.development,
					build: true,
				},
				cwd,
			);

			if (entries.length > 1) {
				log.error(
					`fragment can only build one sketch at a time.`,
					prefix,
				);
				return;
			}

			let startTime = Date.now();

			await viteBuild(
				mergeConfig(config, {
					logLevel: 'info',
					base,
					build: {
						outDir: outDirPath,
						emptyOutDir,
					},
					plugins: [hotShaderReplacement({ cwd })],
				}),
			);

			// line break after vite logs
			log.message();

			log.success(
				`Done in ${prettifyTime(Date.now() - startTime)}`,
				prefix,
			);
		}
	} catch (error) {
		log.error(`Error\n`, prefix);
		console.error(error);
	}
}
