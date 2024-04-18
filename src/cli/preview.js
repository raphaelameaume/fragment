import path from 'node:path';
import fs from 'node:fs';
import { preview as vitePreview } from 'vite';
import { bold, cyan, log, magenta } from './log.js';
import * as p from './prompts.js';

/**
 * Preview a sketch
 * @param {string} dir
 * @param {object} [options]
 * @param {boolean} [options.open=false]
 */
export async function preview(dir, options = {}) {
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

		const previewServer = await vitePreview({
			build: {
				outDir,
			},
			preview: {
				host: true,
				open: options.open,
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
