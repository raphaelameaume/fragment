import path from 'node:path';
import fs from 'node:fs';
import { preview as vitePreview } from 'vite';
import { loadConfig } from './createConfig.js';
import { bold, cyan, log, magenta } from './log.js';
import * as p from './prompts.js';

/**
 * Preview a sketch
 * @param {string} dir
 * @param {object} [options={}]
 * @param {number} options.port
 * @param {boolean} options.open
 * @param {string} options.configFilepath
 * @returns {Promise<void>}
 */
export async function preview(dir, { port, open, configFilepath } = {}) {
	const cwd = process.cwd();
	const prefix = log.prefix('preview');

	const outDir = path.join(cwd, dir);

	try {
		if (!fs.existsSync(outDir)) {
			throw new Error(
				`Directory ${magenta(dir)} does not exist in ${cwd}`,
			);
		}

		log.message(`${magenta(outDir)}\n`, prefix);

		const fragmentConfig = await loadConfig({
			cwd,
			filepath: configFilepath,
		});

		port = port ?? fragmentConfig.port;
		open = open ?? fragmentConfig.open;

		const previewServer = await vitePreview({
			build: {
				outDir,
			},
			preview: {
				host: true,
				port,
				open,
			},
		});

		const { resolvedUrls } = previewServer;

		let urls = [
			...resolvedUrls.local.map(
				(url) => `${bold('Local')}:   ${bold(cyan(url))}`,
			),
			...resolvedUrls.network.map(
				(url) => `${bold('Network')}: ${bold(cyan(url))}`,
			),
		];
		p.note(urls.join(`\n`));
	} catch (error) {
		log.error(`Error\n`, prefix);
		console.error(error);
	}
}
