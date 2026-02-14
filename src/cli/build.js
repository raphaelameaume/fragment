import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { mergeConfig, build as viteBuild } from 'vite';
import { loadConfig, createConfig } from './createConfig.js';
import { getEntries } from './getEntries.js';
import { log, magenta } from './log.js';
import * as p from './prompts.js';
import { handleCancelledPrompt, mkdirp, prettifyTime } from './utils.js';
import hotShaderReplacement from './plugins/hot-shader-replacement.js';

/**
 * Build a sketch for production
 * @param {string} entry
 * @param {object} [options={}]
 * @param {boolean} options.development
 * @param {string} options.outDir
 * @param {boolean} options.emptyOutDir
 * @param {string} options.base
 * @param {boolean} options.prompts
 * @param {string} options.configFilepath
 * @returns {Promise<void>}
 */
export async function build(
	entry,
	{ development, outDir, emptyOutDir, base, prompts, configFilepath } = {},
) {
	const cwd = process.cwd();
	const command = 'build';
	const prefix = log.prefix(command);

	try {
		const entries = await getEntries(entry, cwd, command, prefix);

		if (!entries.length) return;

		log.message(`${magenta(entry)}\n`, prefix);

		const fragmentConfig = await loadConfig({
			cwd,
			filepath: configFilepath,
		});

		outDir =
			outDir ??
			fragmentConfig.build?.outDir ??
			entries[0].split(path.extname(entries[0]))[0];
		emptyOutDir = emptyOutDir ?? fragmentConfig.build?.emptyOutDir;
		base = base ?? fragmentConfig.build?.base;
		prompts = prompts ?? fragmentConfig.build?.prompts;

		if (prompts) {
			outDir = await p.text({
				message: 'Output directory:',
				placeholder: '.',
				hint: '(hit Enter to use current directory)',
				initialValue: outDir,
			});

			handleCancelledPrompt(outDir, prefix);
		}

		if (!outDir) {
			outDir = '';
		}

		let outDirPath = path.join(cwd, outDir);

		// create directory if it doesn't exist
		mkdirp(outDirPath);

		const files = await readdir(outDirPath);

		if (files.length > 0) {
			log.warn(`${outDirPath} is not an empty folder.\n`);

			if (prompts) {
				emptyOutDir = await p.confirm({
					message: 'Empty folder before building?',
					active: 'Yes',
					inactive: 'No',
					initialValue: emptyOutDir,
				});

				handleCancelledPrompt(emptyOutDir, prefix);
			}
		}

		if (prompts) {
			base = await p.text({
				message: 'Base public path:',
				placeholder: `/`,
				hint: '(Hit Enter to validate)',
				initialValue: base,
			});

			handleCancelledPrompt(base, prefix);
		}

		if (entries.length > 0) {
			log.message(
				`Building ${magenta(entries[0])} for production...\n`,
				prefix,
			);

			const config = await createConfig(
				entries,
				{
					dev: development,
					build: true,
				},
				fragmentConfig.vite,
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
						emptyOutDir: emptyOutDir,
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
