import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { mergeConfig, build as viteBuild } from 'vite';
import { createConfig } from './createConfig.js';
import { getEntries } from './getEntries.js';
import { log, magenta } from './log.js';
import * as p from './prompts.js';
import { handleCancelledPrompt, mkdirp, prettifyTime } from './utils.js';
import hotShaderReplacement from './plugins/hot-shader-replacement.js';

/**
 * Build a sketch for production
 * @param {string} entry
 * @param {object} [options]
 * @param {string} [options.base]
 * @param {string} [options.outDir]
 * @param {boolean} [options.emptyOutDir]
 * @param {boolean} [options.development]
 * @param {string} [options.configFilepath]
 * @param {boolean} [options.prompts=true]
 */
export async function build(entry, options = {}) {
	const cwd = process.cwd();
	const command = 'build';
	const prefix = log.prefix(command);

	const { prompts = true } = options;

	try {
		const entries = await getEntries(entry, cwd, command, prefix);

		if (!entries.length) return;

		log.message(`${magenta(entry)}\n`, prefix);

		/** @type {string|undefined} */
		let outDir =
			options.outDir ?? entries[0].split(path.extname(entries[0]))[0];

		if (prompts) {
			const outDirAnswer = await p.text({
				message: 'Output directory:',
				placeholder: '.',
				hint: '(hit Enter to use current directory)',
				initialValue: outDir,
			});

			handleCancelledPrompt(outDirAnswer, prefix);

			outDir = outDirAnswer;
		}

		if (!outDir) {
			outDir = '';
		}

		let outDirPath = path.join(cwd, outDir);

		// create directory if it doesn't exist
		mkdirp(outDirPath);

		const files = await readdir(outDirPath);

		/** @type {boolean} */
		let emptyOutDir = options.emptyOutDir ?? true;

		if (files.length > 0) {
			log.warn(`${outDirPath} is not an empty folder.\n`);

			if (prompts) {
				const emptyOutDirAnswer = await p.confirm({
					message: 'Empty folder before building?',
					active: 'Yes',
					inactive: 'No',
					initialValue: emptyOutDir,
				});

				handleCancelledPrompt(emptyOutDirAnswer, prefix);

				emptyOutDir = emptyOutDirAnswer ?? true;
			}
		}

		/** @type {string|undefined} */
		let base = options.base;

		if (prompts) {
			const baseAnswer = await p.text({
				message: 'Base public path:',
				placeholder: `/`,
				hint: '(Hit Enter to validate)',
				initialValue: base,
				defaultValue: '/',
			});

			handleCancelledPrompt(baseAnswer, prefix);

			base = baseAnswer;
		}

		if (entries.length > 0) {
			log.message(
				`Building ${magenta(entries[0])} for production...\n`,
				prefix,
			);

			const config = await createConfig(
				entries,
				{
					dev: options.development,
					build: true,
				},
				options.configFilepath,
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
